import catchAsyncErrors from "../middlewares/catchAsyncErrors";
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../middlewares/sendResponse";
import { getIntegerPart } from "../utils/getIntegerfromString";

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

    const{selectedTutors , status}= req.body;

    const student = await prismadb.student.findFirst({
      where: {
        id: student_id,
      },
    });

    if(!student){
      return sendResponse(res, {
        status: 404,
        message: " cannot make request, Student not found",
      });
    }

    const tutorRequest= await prismadb.tutorRequest.create({
      data:{
        studentId: student_id,
        selectedTutors: selectedTutors,
        status: "PENDING"
      }
    });

    await prismadb.tutorRequestMatch.createMany({
      data: selectedTutors.map((tut: any)=>{
        return{
          requestId: tutorRequest.id,
          tutorId: tut.id,
          accepted: false
        }
      })
    })


    return sendResponse(res, {
      status: 201,
      data: tutorRequest,
      message: "Request created",
    });
  }
);
