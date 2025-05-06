"use strict";
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
exports.createStudent = (0, catchAsyncErrors_1.default)(async (req, res, next) => {
    const { name, email, contact, password, role } = req.body;
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
    const existingStudent = await prismaDb_1.default.student.findFirst({
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
    const salt = await bcrypt_1.default.genSalt(10);
    const hash = await bcrypt_1.default.hash(password, salt);
    const student = await prismaDb_1.default.student.create({
        data: {
            name,
            email,
            contact,
            password: hash,
            role
        }
    });
    const { password: _, ...studentWithoutPassword } = student;
    return (0, sendResponse_1.sendResponse)(res, {
        status: 201,
        data: studentWithoutPassword,
        message: "Student created successfully",
    });
});
exports.loginStudent = (0, catchAsyncErrors_1.default)(async (req, res, next) => {
    const { contact, password } = req.body;
    if (!contact || !password) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 400,
            message: "Please fill all fields",
        });
    }
    const student = await prismaDb_1.default.student.findFirst({
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
    const isPasswordMatch = await bcrypt_1.default.compare(password, student.password);
    if (!isPasswordMatch) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 401,
            message: "Invalid credentials",
        });
    }
    const token = (0, tokenManger_1.createToken)({ id: student.id, role: student.role }, "1d");
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 86400000 });
    return (0, sendResponse_1.sendResponse)(res, {
        status: 200,
        data: {
            student,
            token
        },
        message: "Login successful",
    });
});
exports.createStudentInfo = (0, catchAsyncErrors_1.default)(async (req, res, next) => {
    const { student_id } = req.params;
    const { availableTime, subjects, address, } = req.body;
    if (!availableTime || !subjects || !address) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 400,
            message: "Please fill all fields",
        });
    }
    const existingStudentInfo = await prismaDb_1.default.studentInfo.findFirst({
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
    const studentInfo = await prismaDb_1.default.studentInfo.create({
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
});
exports.getStudentInfo = (0, catchAsyncErrors_1.default)(async (req, res, next) => {
    const { student_id } = req.params;
    const studentInfo = await prismaDb_1.default.studentInfo.findFirst({
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
});
exports.updateStudentInfo = (0, catchAsyncErrors_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const { availableTime, subjects, address, } = req.body;
    if (!availableTime || !subjects || !address) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 400,
            message: "Please fill all fields",
        });
    }
    const studentInfo = await prismaDb_1.default.studentInfo.findFirst({
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
    const updatedStudentInfo = await prismaDb_1.default.studentInfo.update({
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
});
exports.deleteStudentInfo = (0, catchAsyncErrors_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const studentInfo = await prismaDb_1.default.studentInfo.findFirst({
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
    await prismaDb_1.default.studentInfo.delete({
        where: {
            id: id,
        },
    });
    return (0, sendResponse_1.sendResponse)(res, {
        status: 200,
        message: "Student info deleted successfully",
    });
});
