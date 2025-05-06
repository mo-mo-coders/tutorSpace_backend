"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStudentInfo = exports.updateStudentInfo = exports.getStudentInfo = exports.createStudentInfo = exports.loginStudent = exports.createStudent = void 0;
const catchAsyncErrors_1 = __importDefault(require("../middlewares/catchAsyncErrors"));
const sendResponse_1 = require("../middlewares/sendResponse");
const tokenManger_1 = require("../utils/tokenManger");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prismaDb_1 = __importDefault(require("../db/prismaDb"));
const zod_1 = __importDefault(require("zod"));
const emailSchema = zod_1.default.string().email();
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
exports.createStudent = (0, catchAsyncErrors_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, contact, password, role } = req.body;
    // error handling
    if (!name || !contact || !password || !role) {
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
    // const passwordValidation = passwordSchema.safeParse(password);
    // if(!passwordValidation.success){
    //     return sendResponse(res, {
    //         status: 400,
    //         error: passwordValidation.error.errors[0].message,
    //     });
    // }
    const existingStudent = yield prismaDb_1.default.student.findFirst({
        where: {
            contact,
        },
    });
    if (existingStudent) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 400,
            message: "Student already exists",
        });
    }
    const salt = yield bcrypt_1.default.genSalt(10);
    const hash = yield bcrypt_1.default.hash(password, salt);
    const student = yield prismaDb_1.default.student.create({
        data: {
            name,
            email,
            contact,
            password: hash,
            role
        }
    });
    const { password: _ } = student, studentWithoutPassword = __rest(student, ["password"]);
    return (0, sendResponse_1.sendResponse)(res, {
        status: 201,
        data: studentWithoutPassword,
        message: "Student created successfully",
    });
}));
// login student
exports.loginStudent = (0, catchAsyncErrors_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { contact, password } = req.body;
    if (!contact || !password) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 400,
            message: "Please fill all fields",
        });
    }
    const student = yield prismaDb_1.default.student.findFirst({
        where: {
            contact,
        },
    });
    if (!student) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 401,
            message: "Invalid credentials",
        });
    }
    const isPasswordMatch = yield bcrypt_1.default.compare(password, student.password);
    if (!isPasswordMatch) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 401,
            message: "Invalid credentials",
        });
    }
    // generate jwt token
    const token = (0, tokenManger_1.createToken)({ id: student.id, role: student.role }, "1d");
    // set cookies
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 86400000 });
    return (0, sendResponse_1.sendResponse)(res, {
        status: 200,
        data: {
            student,
            token
        },
        message: "Login successful",
    });
}));
// create student info
exports.createStudentInfo = (0, catchAsyncErrors_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // destructure the id from params.
    const { student_id } = req.params;
    const { availableTime, subjects, address, } = req.body;
    if (!availableTime || !subjects || !address) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 400,
            message: "Please fill all fields",
        });
    }
    const existingStudentInfo = yield prismaDb_1.default.studentInfo.findFirst({
        where: {
            studentId: student_id,
        },
    });
    if (existingStudentInfo) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 400,
            message: "Student info already exists",
        });
    }
    const studentInfo = yield prismaDb_1.default.studentInfo.create({
        data: {
            availableTime,
            subjects,
            address,
            studentId: student_id
        }
    });
    return (0, sendResponse_1.sendResponse)(res, {
        status: 201,
        data: studentInfo,
        message: "Student info created successfully",
    });
}));
// get student Info
exports.getStudentInfo = (0, catchAsyncErrors_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { student_id } = req.params;
    const studentInfo = yield prismaDb_1.default.studentInfo.findFirst({
        where: {
            studentId: student_id,
        },
        include: {
            student: true
        }
    });
    if (!studentInfo) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 404,
            message: "Student info not found",
        });
    }
    return (0, sendResponse_1.sendResponse)(res, {
        status: 200,
        data: studentInfo,
        message: "Student info found",
    });
}));
// update student info
exports.updateStudentInfo = (0, catchAsyncErrors_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { availableTime, subjects, address, } = req.body;
    if (!availableTime || !subjects || !address) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 400,
            message: "Please fill all fields",
        });
    }
    const studentInfo = yield prismaDb_1.default.studentInfo.findFirst({
        where: {
            id: id,
        },
    });
    if (!studentInfo) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 404,
            message: "Student info not found",
        });
    }
    const updatedStudentInfo = yield prismaDb_1.default.studentInfo.update({
        where: {
            id: id,
        },
        data: {
            availableTime,
            subjects,
            address,
        },
    });
    return (0, sendResponse_1.sendResponse)(res, {
        status: 200,
        data: updatedStudentInfo,
        message: "Student info updated successfully",
    });
}));
// delete student info
exports.deleteStudentInfo = (0, catchAsyncErrors_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const studentInfo = yield prismaDb_1.default.studentInfo.findFirst({
        where: {
            id: id,
        },
    });
    if (!studentInfo) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 404,
            message: "Student info not found",
        });
    }
    yield prismaDb_1.default.studentInfo.delete({
        where: {
            id: id,
        },
    });
    return (0, sendResponse_1.sendResponse)(res, {
        status: 200,
        message: "Student info deleted successfully",
    });
}));
