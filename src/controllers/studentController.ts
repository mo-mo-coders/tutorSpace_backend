import catchAsyncErrors from "../middlewares/catchAsyncErrors";
import { Request, Response ,NextFunction } from "express";
import { sendResponse } from "../middlewares/sendResponse";
import { createToken } from "../utils/tokenManger";
import bcrypt from "bcrypt";

import prismadb from "../db/prismaDb";

import z from "zod";

const emailSchema = z.string().email();

// const minLengthErrorMessage = "Password must be at least 8 characters long";
// const maxLengthErrorMessage = "Password must be at most 20 characters long";
// const uppercaseErrorMessage = "Password must contain at least one uppercase letter";
// const lowercaseErrorMessage = "Password must contain at least one lowercase letter";
// const numberErrorMessage = "Password must contain at least one number";
// const specialCharacterErrorMessage = "Password must contain at least one special character";

// const passwordSchema = z
//   .string()
//   .min(8, { message: minLengthErrorMessage })
//   .max(20, { message: maxLengthErrorMessage })
//   .refine((password) => /[A-Z]/.test(password), {
//     message: uppercaseErrorMessage,
//   })
//   .refine((password) => /[a-z]/.test(password), {
//     message: lowercaseErrorMessage, 
//   })
//   .refine((password) => /[0-9]/.test(password), { message: numberErrorMessage })
//   .refine((password) => /[!@#$%^&*]/.test(password), {
//     message: specialCharacterErrorMessage,
//   });



// signup student
export const createStudent= catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const {name , email , contact ,password , role}=req.body

    // error handling
    if (!name || !contact || !password || !role) {
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

    // const passwordValidation = passwordSchema.safeParse(password);
    // if(!passwordValidation.success){
    //     return sendResponse(res, {
    //         status: 400,
    //         error: passwordValidation.error.errors[0].message,
    //     });
    // }

    const existingStudent = await prismadb.student.findFirst({
        where: {
            contact,
        },
    });

    if(existingStudent){
        return sendResponse(res, {
            status: 400,
            message: "Student already exists",
        });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const student= await prismadb.student.create({
        data:{
            name,
            email,
            contact,
            password: hash,
            role
        }
    });

    const { password: _, ...studentWithoutPassword } = student;

    return sendResponse(res, {
        status: 201,
        data: studentWithoutPassword,
        message: "Student created successfully",
    });
});

// login student
export const loginStudent= catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {

    const { contact, password } = req.body;

    if (!contact || !password) {
        return sendResponse(res, {
            status: 400,
            message: "Please fill all fields",
        });
    }

    const student = await prismadb.student.findFirst({
        where: {
            contact,
        },
    });

    if (!student) {
        return sendResponse(res, {
            status: 401,
            message: "Invalid credentials",
        });
    }

    const isPasswordMatch = await bcrypt.compare(password, student.password);

    if (!isPasswordMatch) {
        return sendResponse(res, {
            status: 401,
            message: "Invalid credentials",
        });
    }

    // generate jwt token
    const token = createToken({id: student.id , role: student.role }, "1d");

    // set cookies
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 86400000 });

    return sendResponse(res, {
        status: 200,
        data: {
            student,
            token
        },
        message: "Login successful",
    });
});

// create student info
export const createStudentInfo= catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {

    // destructure the id from params.
    const {student_id}= req.params;
    
    const {availableTime ,subjects ,address ,}=req.body;

    if(!availableTime || !subjects || !address){
        return sendResponse(res, {
            status: 400,
            message: "Please fill all fields",
        });
    }

    const existingStudentInfo = await prismadb.studentInfo.findFirst({
        where: {
            studentId: student_id,
        },
    });

    if(existingStudentInfo){
        return sendResponse(res, {
            status: 400,
            message: "Student info already exists",
        });
    }

    const studentInfo= await prismadb.studentInfo.create({
        data:{
            availableTime,
            subjects,
            address,
            studentId: student_id
        }
    });

    return sendResponse(res, {
        status: 201,
        data: studentInfo,
        message: "Student info created successfully",
    });

});

// get student Info
export const getStudentInfo= catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {

    const {student_id}= req.params;

    const studentInfo = await prismadb.studentInfo.findFirst({
        where: {
            studentId: student_id,
        },
        include:{
            student:true
        }
    });

    if (!studentInfo) {
        return sendResponse(res, {
            status: 404,
            message: "Student info not found",
        });
    }

    return sendResponse(res, {
        status: 200,
        data: studentInfo,
        message: "Student info found",
    });
});

// update student info
export const updateStudentInfo= catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    
        const {id}= req.params;
    
        const {availableTime ,subjects ,address ,}=req.body;
    
        if(!availableTime || !subjects || !address){
            return sendResponse(res, {
                status: 400,
                message: "Please fill all fields",
            });
        }
    
        const studentInfo = await prismadb.studentInfo.findFirst({
            where: {
                id: id,
            },
        });
    
        if (!studentInfo) {
            return sendResponse(res, {
                status: 404,
                message: "Student info not found",
            });
        }
    
        const updatedStudentInfo = await prismadb.studentInfo.update({
            where: {
                id: id,
            },
            data: {
                availableTime,
                subjects,
                address,
            },
        });
    
        return sendResponse(res, {
            status: 200,
            data: updatedStudentInfo,
            message: "Student info updated successfully",
        });
    });

// delete student info
export const deleteStudentInfo= catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    
        const {id}= req.params;
    
        const studentInfo = await prismadb.studentInfo.findFirst({
            where: {
                id: id,
            },
        });
    
        if (!studentInfo) {
            return sendResponse(res, {
                status: 404,
                message: "Student info not found",
            });
        }
    
        await prismadb.studentInfo.delete({
            where: {
                id: id,
            },
        });
    
        return sendResponse(res, {
            status: 200,
            message: "Student info deleted successfully",
        });
    });