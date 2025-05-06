"use strict";
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
exports.getMatchedTutors = (0, catchAsyncErrors_1.default)(async (req, res, next) => {
    const { student_id } = req.params;
    const student_info = await prismaDb_1.default.studentInfo.findFirst({
        where: {
            studentId: student_id,
        },
    });
    const studentSubjects = student_info?.subjects;
    const matchedTutorInfo = await prismaDb_1.default.tutorInfo.findMany({
        where: {
            subjects: {
                hasSome: studentSubjects,
            },
        },
        include: {
            tutor: true,
            tutorCard: true,
        },
    });
    const tutorsWithRating = matchedTutorInfo.map((info) => {
        const firstCard = info.tutorCard?.[0];
        return {
            tutor: info.tutor,
            rating: firstCard?.rating || 0,
            experience: (0, getIntegerfromString_1.getIntegerPart)(info.experience) || 0,
        };
    });
    const sortedByRating = tutorsWithRating.sort((a, b) => {
        if (b.rating !== a.rating) {
            return b.rating - a.rating;
        }
        return b.experience - a.experience;
    });
    const topTutors = sortedByRating.slice(0, 5).map((item) => item.tutor);
    return (0, sendResponse_1.sendResponse)(res, {
        status: 200,
        topTutors: topTutors,
        matchedTutorInfo: matchedTutorInfo,
        message: "Top 5 tutors found",
    });
});
exports.createTutorRequest = (0, catchAsyncErrors_1.default)(async (req, res, next) => {
    const { student_id } = req.params;
    const { selectedTutors, status, subjects } = req.body;
    const student = await prismaDb_1.default.student.findFirst({
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
    const existingRequest = await prismaDb_1.default.tutorRequest.findFirst({
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
    const tutorRequest = await prismaDb_1.default.tutorRequest.create({
        data: {
            studentId: student_id,
            selectedTutors: selectedTutors,
            subjects: subjects,
            status: "PENDING",
        },
    });
    await prismaDb_1.default.tutorRequestMatch.createMany({
        data: selectedTutors.map((tut, index) => {
            return {
                requestId: tutorRequest.id,
                tutorId: tut.id,
                accepted: false,
                notifiedAt: index === 0 ? new Date() : null,
            };
        }),
    });
    (0, tutorRequestServices_1.scheduleTutorReassignment)(tutorRequest.id);
    return (0, sendResponse_1.sendResponse)(res, {
        status: 201,
        data: tutorRequest,
        message: "Request created",
    });
});
exports.updateTutorRequest = (0, catchAsyncErrors_1.default)(async (req, res, next) => {
    const { request_id } = req.params;
    console.log("requestId", request_id);
    const tutor_id = req.query.tutor_id;
    const tutorRequestMatch = await prismaDb_1.default.tutorRequestMatch.findFirst({
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
    await prismaDb_1.default.tutorRequestMatch.update({
        where: {
            id: tutorRequestMatch.id,
        },
        data: {
            accepted: true,
        },
    });
    const allAccepted = await prismaDb_1.default.tutorRequestMatch.findMany({
        where: { requestId: request_id, accepted: true },
    });
    if (allAccepted.length > 0) {
        const updatedTutorRequest = await prismaDb_1.default.tutorRequest.update({
            where: { id: request_id },
            data: { status: "IN_PROGRESS" },
        });
        await prismaDb_1.default.lesson.create({
            data: {
                studentId: updatedTutorRequest.studentId,
                tutorId: tutor_id,
                subjects: updatedTutorRequest.subjects,
                status: "ONGOING",
            },
        });
        await prismaDb_1.default.tutorInfo.update({
            where: { tutorId: tutor_id },
            data: { asssigned: true },
        });
        return (0, sendResponse_1.sendResponse)(res, {
            status: 200,
            message: "Tutor request accepted",
        });
    }
});
