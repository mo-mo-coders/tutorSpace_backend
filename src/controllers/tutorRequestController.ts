import catchAsyncErrors from "../middlewares/catchAsyncErrors";
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../middlewares/sendResponse";

import prismadb from "../db/prismaDb";

function getIntegerPart(str: string): number {
  const digitsOnly = str.replace(/\D/g, ""); // Remove all non-digit characters
  return parseInt(digitsOnly, 10) || 0; // Fallback to 0 if parsing fails
}

// get matched tutors
const getMatchedTutors = catchAsyncErrors(
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
