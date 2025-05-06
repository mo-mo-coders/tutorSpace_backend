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
// signup tutor
exports.createTutor = (0, catchAsyncErrors_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, contact, password, role } = req.body;
    // error handling
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
    const hashedPassword = yield bcrypt_1.default.hash(password, 12);
    const tutor = yield prismaDb_1.default.tutor.create({
        data: {
            name,
            email,
            contact,
            role,
            password: hashedPassword,
        },
    });
    const { password: _ } = tutor, tutorWithoutPassword = __rest(tutor, ["password"]);
    (0, sendResponse_1.sendResponse)(res, {
        status: 201,
        data: tutorWithoutPassword,
        message: "Tutor created successfully"
    });
}));
// login tutor
exports.loginTutor = (0, catchAsyncErrors_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 400,
            message: "Please fill all fields",
        });
    }
    const tutor = yield prismaDb_1.default.tutor.findFirst({
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
    const isPasswordMatch = yield bcrypt_1.default.compare(password, tutor.password);
    if (!isPasswordMatch) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 400,
            message: "Invalid credentials",
        });
    }
    // create token
    const token = (0, tokenManger_1.createToken)({ id: tutor.id, role: tutor.role }, "1d");
    // set cookies
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 86400000 });
    (0, sendResponse_1.sendResponse)(res, {
        status: 200,
        data: {
            tutor,
            token
        },
        message: "Tutor logged in successfully",
    });
}));
// createTutorInfo
exports.createTutorInfo = (0, catchAsyncErrors_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { tutor_id } = req.params;
    const { experience, current_education, expected_salary, availableTime, subjects, address, classesWithSubjects } = req.body;
    // error handling
    if (!experience || !current_education || !expected_salary || !availableTime || !subjects || !address || !classesWithSubjects) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 400,
            message: "Please fill all fields",
        });
    }
    const tutorInfo = yield prismaDb_1.default.tutorInfo.create({
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
}));
// getTutorInfo
exports.getTutorInfo = (0, catchAsyncErrors_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { tutor_id } = req.params;
    const tutorInfo = yield prismaDb_1.default.tutorInfo.findFirst({
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
}));
// updateTutorInfo
exports.updateTutorInfo = (0, catchAsyncErrors_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { experience, current_education, expected_salary, availableTime, subjects, address, classesWithSubjects } = req.body;
    if (!experience || !current_education || !expected_salary || !availableTime || !subjects || !address || !classesWithSubjects) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 400,
            message: "Please fill all fields",
        });
    }
    const tutorInfo = yield prismaDb_1.default.tutorInfo.update({
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
}));
// deleteTutorInfo
exports.deleteTutorInfo = (0, catchAsyncErrors_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const tutorInfo = yield prismaDb_1.default.tutorInfo.delete({
        where: {
            id: id,
        },
    });
    (0, sendResponse_1.sendResponse)(res, {
        status: 200,
        data: tutorInfo,
        message: "Tutor info deleted successfully",
    });
}));
