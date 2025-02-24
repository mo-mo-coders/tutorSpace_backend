import catchAsyncErrors from "../middlewares/catchAsyncErrors";
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../middlewares/sendResponse";
import { getIntegerPart } from "../utils/getIntegerfromString";

import { scheduleTutorReassignment } from "../services/tutorRequestServices";

import { Worker } from "bullmq";
import prismadb from "../db/prismaDb";

// get matched tutors
export const getMatchedTutors = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { student_id } = req.params;

    const student_info = await prismadb.studentInfo.findFirst({
      where: {
        studentId: student_id,
      },
    });

    const studentSubjects = student_info?.subjects;

    const matchedTutorInfo = await prismadb.tutorInfo.findMany({
      where: {
        subjects: {
          hasSome: studentSubjects, // Matching subjects
        },
      },
      include: {
        tutor: true,
        tutorCard: true,
      },
    });

    // Prepare array combining tutor and rating from the first tutorCard (if it exists)
    const tutorsWithRating = matchedTutorInfo.map((info) => {
      const firstCard = info.tutorCard?.[0]; // Get the first tutorCard entry (if any)
      return {
        tutor: info.tutor,
        rating: firstCard?.rating || 0,
        experience: getIntegerPart(info.experience) || 0,
      };
    });
    
    const sortedByRating = tutorsWithRating.sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return b.experience - a.experience;
    });

    // Take the top 5
    const topTutors = sortedByRating.slice(0, 5).map((item) => item.tutor);

    return sendResponse(res, {
      status: 200,
      data: topTutors,
      message: "Top 5 tutors found",
    });
  }
);

// create tutor request and match tutors to student
export const createTutorRequest = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { student_id } = req.params;

    const { selectedTutors, status , subjects } = req.body;

    const student = await prismadb.student.findFirst({
      where: {
        id: student_id,
      },
    });

    if (!student) {
      return sendResponse(res, {
        status: 404,
        message: " cannot make request, Student not found",
      });
    }

    const existingRequest = await prismadb.tutorRequest.findFirst({
      where: {
        studentId: student_id,
        status: "IN_PROGRESS",
      },
    });


    if (existingRequest) {
      return sendResponse(res, {
        status: 400,
        message: "Student already has a request in progress",
      });
    }

    const tutorRequest = await prismadb.tutorRequest.create({
      data: {
        studentId: student_id,
        selectedTutors: selectedTutors,
        subjects: subjects,
        status: "PENDING",
      },
    });

    await prismadb.tutorRequestMatch.createMany({
      data: selectedTutors.map((tut: any, index: number) => {
        return {
          requestId: tutorRequest.id,
          tutorId: tut.id,
          accepted: false,
          notifiedAt: index === 0 ? new Date() : null, // Notify the first tutor immediately
        };
      }),
    });

    scheduleTutorReassignment(tutorRequest.id);

    // Worker to process tutor reassignment
    new Worker("tutorQueue", async (job) => {
      const { requestId } = job.data;

      // Find the current tutor who was notified but hasn't responded
      const currentTutor = await prismadb.tutorRequestMatch.findFirst({
        where: { requestId, accepted: false, notifiedAt: { not: null } },
      });

      if (!currentTutor) return;

      // Find the next tutor
      const nextTutor = await prismadb.tutorRequestMatch.findFirst({
        where: { requestId, notifiedAt: null },
        orderBy: { createdAt: "asc" },
      });

      if (nextTutor) {
        // Notify the next tutor
        await prismadb.tutorRequestMatch.update({
          where: { id: nextTutor.id },
          data: { notifiedAt: new Date() },
        });

        // Schedule another check in 3 hours
        await scheduleTutorReassignment(requestId);
      }
    });

    return sendResponse(res, {
      status: 201,
      data: tutorRequest,
      message: "Request created",
    });
  }
);

// accept tutor request from tutor side and update in the database
export const updateTutorRequest= catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { requestId, tutorId } = req.params;

    const tutorRequestMatch = await prismadb.tutorRequestMatch.findFirst({
      where: {
        requestId,
        tutorId,
      },
    });

    if (!tutorRequestMatch) {
      return sendResponse(res, {
        status: 404,
        message: "Tutor request not found",
      });
    }

    await prismadb.tutorRequestMatch.update({
      where: {
        id: tutorRequestMatch.id,
      },
      data: {
        accepted: true,
      },
    });

    const allAccepted = await prismadb.tutorRequestMatch.findMany({
      where: { requestId, accepted: true },
    });
  
    if (allAccepted.length > 0) {
      // Update TutorRequest status
      const updatedTutorRequest=await prismadb.tutorRequest.update({
        where: { id: requestId },
        data: { status: "IN_PROGRESS" },
      });
  
      // Store lesson in Lessons table
      await prismadb.lesson.create({
        data: {
          studentId: updatedTutorRequest.studentId,
          tutorId: tutorId,
          subjects: updatedTutorRequest.subjects,
          status: "ONGOING",
        },
      });

    return sendResponse(res, {
      status: 200,
      message: "Tutor request accepted",
    });
  }
});
