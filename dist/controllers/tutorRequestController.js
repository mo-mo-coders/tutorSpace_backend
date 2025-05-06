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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTutorRequest = exports.createTutorRequest = exports.getMatchedTutors = void 0;
const catchAsyncErrors_1 = __importDefault(require("../middlewares/catchAsyncErrors"));
const sendResponse_1 = require("../middlewares/sendResponse");
const getIntegerfromString_1 = require("../utils/getIntegerfromString");
const tutorRequestServices_1 = require("../services/tutorRequestServices");
const prismaDb_1 = __importDefault(require("../db/prismaDb"));
// get matched tutors
exports.getMatchedTutors = (0, catchAsyncErrors_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { student_id } = req.params;
    const student_info = yield prismaDb_1.default.studentInfo.findFirst({
        where: {
            studentId: student_id,
        },
    });
    const studentSubjects = student_info === null || student_info === void 0 ? void 0 : student_info.subjects;
    const matchedTutorInfo = yield prismaDb_1.default.tutorInfo.findMany({
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
        var _a;
        const firstCard = (_a = info.tutorCard) === null || _a === void 0 ? void 0 : _a[0]; // Get the first tutorCard entry (if any)
        return {
            tutor: info.tutor,
            rating: (firstCard === null || firstCard === void 0 ? void 0 : firstCard.rating) || 0,
            experience: (0, getIntegerfromString_1.getIntegerPart)(info.experience) || 0,
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
    return (0, sendResponse_1.sendResponse)(res, {
        status: 200,
        topTutors: topTutors,
        matchedTutorInfo: matchedTutorInfo,
        message: "Top 5 tutors found",
    });
}));
// create tutor request and match tutors to student
exports.createTutorRequest = (0, catchAsyncErrors_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { student_id } = req.params;
    const { selectedTutors, status, subjects } = req.body;
    const student = yield prismaDb_1.default.student.findFirst({
        where: {
            id: student_id,
        },
    });
    if (!student) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 404,
            message: " cannot make request, Student not found",
        });
    }
    const existingRequest = yield prismaDb_1.default.tutorRequest.findFirst({
        where: {
            studentId: student_id,
            status: "IN_PROGRESS",
        },
    });
    if (existingRequest) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 400,
            message: "Student already has a request in progress",
        });
    }
    const tutorRequest = yield prismaDb_1.default.tutorRequest.create({
        data: {
            studentId: student_id,
            selectedTutors: selectedTutors,
            subjects: subjects,
            status: "PENDING",
        },
    });
    yield prismaDb_1.default.tutorRequestMatch.createMany({
        data: selectedTutors.map((tut, index) => {
            return {
                requestId: tutorRequest.id,
                tutorId: tut.id,
                accepted: false,
                notifiedAt: index === 0 ? new Date() : null, // Notify the first tutor immediately
            };
        }),
    });
    (0, tutorRequestServices_1.scheduleTutorReassignment)(tutorRequest.id);
    return (0, sendResponse_1.sendResponse)(res, {
        status: 201,
        data: tutorRequest,
        message: "Request created",
    });
}));
// accept tutor request from tutor side and update in the database
exports.updateTutorRequest = (0, catchAsyncErrors_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { request_id } = req.params;
    console.log("requestId", request_id);
    const tutor_id = req.query.tutor_id;
    const tutorRequestMatch = yield prismaDb_1.default.tutorRequestMatch.findFirst({
        where: {
            requestId: request_id,
            tutorId: tutor_id,
        },
    });
    if (!tutorRequestMatch) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 404,
            message: "Tutor request not found",
        });
    }
    yield prismaDb_1.default.tutorRequestMatch.update({
        where: {
            id: tutorRequestMatch.id,
        },
        data: {
            accepted: true,
        },
    });
    const allAccepted = yield prismaDb_1.default.tutorRequestMatch.findMany({
        where: { requestId: request_id, accepted: true },
    });
    if (allAccepted.length > 0) {
        // Update TutorRequest status
        const updatedTutorRequest = yield prismaDb_1.default.tutorRequest.update({
            where: { id: request_id },
            data: { status: "IN_PROGRESS" },
        });
        // Store lesson in Lessons table
        yield prismaDb_1.default.lesson.create({
            data: {
                studentId: updatedTutorRequest.studentId,
                tutorId: tutor_id,
                subjects: updatedTutorRequest.subjects,
                status: "ONGOING",
            },
        });
        yield prismaDb_1.default.tutorInfo.update({
            where: { tutorId: tutor_id },
            data: { asssigned: true },
        });
        return (0, sendResponse_1.sendResponse)(res, {
            status: 200,
            message: "Tutor request accepted",
        });
    }
}));
