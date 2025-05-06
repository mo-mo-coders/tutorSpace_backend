"use strict";
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
async function scheduleTutorReassignment(requestId, delay = 5 * 60 * 1000) {
    await tutorQueue.add("reassignTutor", { requestId }, { delay });
}
new bullmq_2.Worker("tutorQueue", async (job) => {
    const { requestId } = job.data;
    const currentTutor = await prismaDb_1.default.tutorRequestMatch.findFirst({
        where: { requestId, accepted: false, notifiedAt: { not: null } },
    });
    if (!currentTutor)
        return;
    const nextTutor = await prismaDb_1.default.tutorRequestMatch.findFirst({
        where: { requestId, notifiedAt: null },
        orderBy: { createdAt: "asc" },
    });
    if (nextTutor) {
        await prismaDb_1.default.tutorRequestMatch.update({
            where: { id: nextTutor.id },
            data: { notifiedAt: new Date() },
        });
        await scheduleTutorReassignment(requestId);
    }
}, {
    connection: {
        host: 'redis-13058.c262.us-east-1-3.ec2.redns.redis-cloud.com',
        port: 13058,
        username: "default",
        password: config_1.default.REDIS_PASSWORD,
    }
});
