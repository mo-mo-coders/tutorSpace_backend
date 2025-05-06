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
exports.scheduleTutorReassignment = scheduleTutorReassignment;
const bullmq_1 = require("bullmq");
const config_1 = __importDefault(require("../config/config"));
const bullmq_2 = require("bullmq");
const prismaDb_1 = __importDefault(require("../db/prismaDb"));
const tutorQueue = new bullmq_1.Queue('tutorQueue', {
    connection: {
        host: 'redis-13058.c262.us-east-1-3.ec2.redns.redis-cloud.com',
        port: 13058,
        username: "default",
        password: config_1.default.REDIS_PASSWORD,
    }
});
// Function to add job to queue
function scheduleTutorReassignment(requestId_1) {
    return __awaiter(this, arguments, void 0, function* (requestId, delay = 5 * 60 * 1000) {
        yield tutorQueue.add("reassignTutor", { requestId }, { delay });
    });
}
// Worker to process tutor reassignment
new bullmq_2.Worker("tutorQueue", (job) => __awaiter(void 0, void 0, void 0, function* () {
    const { requestId } = job.data;
    // Find the current tutor who was notified but hasn't responded
    const currentTutor = yield prismaDb_1.default.tutorRequestMatch.findFirst({
        where: { requestId, accepted: false, notifiedAt: { not: null } },
    });
    if (!currentTutor)
        return;
    // Find the next tutor
    const nextTutor = yield prismaDb_1.default.tutorRequestMatch.findFirst({
        where: { requestId, notifiedAt: null },
        orderBy: { createdAt: "asc" },
    });
    if (nextTutor) {
        // Notify the next tutor
        yield prismaDb_1.default.tutorRequestMatch.update({
            where: { id: nextTutor.id },
            data: { notifiedAt: new Date() },
        });
        // Schedule another check in 3 hours
        yield scheduleTutorReassignment(requestId);
    }
}), {
    connection: {
        host: 'redis-13058.c262.us-east-1-3.ec2.redns.redis-cloud.com',
        port: 13058,
        username: "default",
        password: config_1.default.REDIS_PASSWORD,
    }
});
