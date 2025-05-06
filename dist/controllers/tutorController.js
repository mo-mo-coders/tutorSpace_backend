"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTutorInfo = exports.updateTutorInfo = exports.getTutorInfo = exports.createTutorInfo = exports.loginTutor = exports.createTutor = void 0;
const catchAsyncErrors_1 = __importDefault(require("../middlewares/catchAsyncErrors"));
const sendResponse_1 = require("../middlewares/sendResponse");
const tokenManger_1 = require("../utils/tokenManger");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prismaDb_1 = __importDefault(require("../db/prismaDb"));
const zod_1 = __importDefault(require("zod"));
const emailSchema = zod_1.default.string().email();
const minLengthErrorMessage = "Password must be at least 8 characters long";
const maxLengthErrorMessage = "Password must be at most 20 characters long";
const uppercaseErrorMessage = "Password must contain at least one uppercase letter";
const lowercaseErrorMessage = "Password must contain at least one lowercase letter";
const numberErrorMessage = "Password must contain at least one number";
const specialCharacterErrorMessage = "Password must contain at least one special character";
const passwordSchema = zod_1.default
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
exports.createTutor = (0, catchAsyncErrors_1.default)(async (req, res, next) => {
    const { name, email, contact, password, role } = req.body;
    if (!name || !email || !contact || !password || !role) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 400,
            message: "Please fill all fields",
        });
    }
    if (email) {
        const emailValidation = emailSchema.safeParse(email);
        if (!emailValidation.success) {
            return (0, sendResponse_1.sendResponse)(res, {
                status: 400,
                error: "Invalid email",
            });
        }
    }
    const passwordValidation = passwordSchema.safeParse(password);
    if (!passwordValidation.success) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 400,
            error: passwordValidation.error.errors[0].message,
        });
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 12);
    const tutor = await prismaDb_1.default.tutor.create({
        data: {
            name,
            email,
            contact,
            role,
            password: hashedPassword,
        },
    });
    const { password: _, ...tutorWithoutPassword } = tutor;
    (0, sendResponse_1.sendResponse)(res, {
        status: 201,
        data: tutorWithoutPassword,
        message: "Tutor created successfully"
    });
});
exports.loginTutor = (0, catchAsyncErrors_1.default)(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 400,
            message: "Please fill all fields",
        });
    }
    const tutor = await prismaDb_1.default.tutor.findFirst({
        where: {
            email,
        },
    });
    if (!tutor) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 400,
            message: "Invalid credentials",
        });
    }
    const isPasswordMatch = await bcrypt_1.default.compare(password, tutor.password);
    if (!isPasswordMatch) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 400,
            message: "Invalid credentials",
        });
    }
    const token = (0, tokenManger_1.createToken)({ id: tutor.id, role: tutor.role }, "1d");
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 86400000 });
    (0, sendResponse_1.sendResponse)(res, {
        status: 200,
        data: {
            tutor,
            token
        },
        message: "Tutor logged in successfully",
    });
});
exports.createTutorInfo = (0, catchAsyncErrors_1.default)(async (req, res, next) => {
    const { tutor_id } = req.params;
    const { experience, current_education, expected_salary, availableTime, subjects, address, classesWithSubjects } = req.body;
    if (!experience || !current_education || !expected_salary || !availableTime || !subjects || !address || !classesWithSubjects) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 400,
            message: "Please fill all fields",
        });
    }
    const tutorInfo = await prismaDb_1.default.tutorInfo.create({
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
    (0, sendResponse_1.sendResponse)(res, {
        status: 201,
        data: tutorInfo,
        message: "Tutor info created successfully",
    });
});
exports.getTutorInfo = (0, catchAsyncErrors_1.default)(async (req, res, next) => {
    const { tutor_id } = req.params;
    const tutorInfo = await prismaDb_1.default.tutorInfo.findFirst({
        where: {
            tutorId: tutor_id,
        },
        include: {
            tutor: true
        }
    });
    if (!tutorInfo) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 404,
            message: "Tutor info not found",
        });
    }
    (0, sendResponse_1.sendResponse)(res, {
        status: 200,
        data: tutorInfo,
        message: "Tutor info found",
    });
});
exports.updateTutorInfo = (0, catchAsyncErrors_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const { experience, current_education, expected_salary, availableTime, subjects, address, classesWithSubjects } = req.body;
    if (!experience || !current_education || !expected_salary || !availableTime || !subjects || !address || !classesWithSubjects) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 400,
            message: "Please fill all fields",
        });
    }
    const tutorInfo = await prismaDb_1.default.tutorInfo.update({
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
    (0, sendResponse_1.sendResponse)(res, {
        status: 200,
        data: tutorInfo,
        message: "Tutor info updated successfully",
    });
});
exports.deleteTutorInfo = (0, catchAsyncErrors_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const tutorInfo = await prismaDb_1.default.tutorInfo.delete({
        where: {
            id: id,
        },
    });
    (0, sendResponse_1.sendResponse)(res, {
        status: 200,
        data: tutorInfo,
        message: "Tutor info deleted successfully",
    });
});
