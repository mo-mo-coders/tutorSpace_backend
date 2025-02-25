import catchAsyncErrors from "../middlewares/catchAsyncErrors";
import { Request, Response ,NextFunction } from "express";
import { sendResponse } from "../middlewares/sendResponse";
import { createToken } from "../utils/tokenManger";
import bcrypt from "bcrypt";

import prismadb from "../db/prismaDb";

import z from "zod";

const emailSchema = z.string().email();

const minLengthErrorMessage = "Password must be at least 8 characters long";
const maxLengthErrorMessage = "Password must be at most 20 characters long";
const uppercaseErrorMessage = "Password must contain at least one uppercase letter";
const lowercaseErrorMessage = "Password must contain at least one lowercase letter";
const numberErrorMessage = "Password must contain at least one number";
const specialCharacterErrorMessage = "Password must contain at least one special character";

const passwordSchema = z
  .string()
  .min(8, { message: minLengthErrorMessage })
  .max(20, { message: maxLengthErrorMessage })
  .refine((password) => /[A-Z]/.test(password), {
    message: uppercaseErrorMessage,
  })
  .refine((password) => /[a-z]/.test(password), {
    message: lowercaseErrorMessage, 
  })
  .refine((password) => /[0-9]/.test(password), { message: numberErrorMessage })
  .refine((password) => /[!@#$%^&*]/.test(password), {
    message: specialCharacterErrorMessage,
  });


// signup tutor
export const createTutor= catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const {name , email , contact ,password , role}=req.body

    // error handling
    if (!name || !email || !contact || !password || !role) {
        return sendResponse(res, {
            status: 400,
            message: "Please fill all fields",
        });
    }

    if (email) {
        const emailValidation = emailSchema.safeParse(email);
        if (!emailValidation.success) {
            return sendResponse(res, {
                status: 400,
                error: "Invalid email",
            });
        }
    }

    const passwordValidation = passwordSchema.safeParse(password);
    if(!passwordValidation.success){
        return sendResponse(res, {
            status: 400,
            error: passwordValidation.error.errors[0].message,
        });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const tutor = await prismadb.tutor.create({
        data: {
            name,
            email,
            contact,
            role,
            password: hashedPassword,
        },
    });

    const { password: _, ...tutorWithoutPassword } = tutor;


    sendResponse(res, {
        status: 201,
        data: tutorWithoutPassword,
        message: "Tutor created successfully"
    });
});

// login tutor
export const loginTutor = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return sendResponse(res, {
            status: 400,
            message: "Please fill all fields",
        });
    }

    const tutor = await prismadb.tutor.findFirst({
        where: {
            email,
        },
    });

    if (!tutor) {
        return sendResponse(res, {
            status: 400,
            message: "Invalid credentials",
        });
    }

    const isPasswordMatch = await bcrypt.compare(password, tutor.password);

    if (!isPasswordMatch) {
        return sendResponse(res, {
            status: 400,
            message: "Invalid credentials",
        });
    }

    // create token
    const token = createToken({id: tutor.id , role: tutor.role} , "1d");

     // set cookies
     res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 86400000 });

    sendResponse(res, {
        status: 200,
        data: {
            tutor,
            token
        },
        message: "Tutor logged in successfully",
    });
});

// createTutorInfo
export const createTutorInfo = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const {tutor_id}= req.params;

    const { experience, current_education, expected_salary, availableTime, subjects , address , classesWithSubjects   } = req.body;

    // error handling
    if (!experience || !current_education || !expected_salary || !availableTime || !subjects || !address || !classesWithSubjects) {
        return sendResponse(res, {
            status: 400,
            message: "Please fill all fields",
        });
    }

    const tutorInfo = await prismadb.tutorInfo.create({
        data: {
            experience,
            current_education,
            expected_salary,
            availableTime,
            subjects,
            address,
            classesWithSubjects,
            tutorId: tutor_id,
        }
    });

    sendResponse(res, {
        status: 201,
        data: tutorInfo,
        message: "Tutor info created successfully",
    });
});

// getTutorInfo
export const getTutorInfo = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const {tutor_id}= req.params;

    const tutorInfo = await prismadb.tutorInfo.findFirst({
        where: {
            tutorId: tutor_id,
        },
        include:{
            tutor:true
        }
    });

    if (!tutorInfo) {
        return sendResponse(res, {
            status: 404,
            message: "Tutor info not found",
        });
    }

    sendResponse(res, {
        status: 200,
        data: tutorInfo,
        message: "Tutor info found",
    });
});

// updateTutorInfo
export const updateTutorInfo = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const {id}= req.params;

    const { experience, current_education, expected_salary, availableTime, subjects , address , classesWithSubjects  } = req.body;

    if (!experience || !current_education || !expected_salary || !availableTime || !subjects || !address || !classesWithSubjects) {
        return sendResponse(res, {
            status: 400,
            message: "Please fill all fields",
        });
    }

    const tutorInfo = await prismadb.tutorInfo.update({
        where: {
            id: id,
        },
        data: {
            experience,
            current_education,
            expected_salary,
            availableTime,
            subjects,
            address,
            classesWithSubjects,
        },
    });

    sendResponse(res, {
        status: 200,
        data: tutorInfo,
        message: "Tutor info updated successfully",
    });
});

// deleteTutorInfo
export const deleteTutorInfo = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const {id}= req.params;

    const tutorInfo = await prismadb.tutorInfo.delete({
        where: {
            id: id,
        },
    });

    sendResponse(res, {
        status: 200,
        data: tutorInfo,
        message: "Tutor info deleted successfully",
    });
});
