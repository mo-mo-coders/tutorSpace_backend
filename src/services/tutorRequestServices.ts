import { Queue } from "bullmq";
import ENV_CONFIG from "../config/config";
import { Worker } from "bullmq";
import prismadb from "../db/prismaDb";


const redisConnection = {
  host: 'redis-10775.c12.us-east-1-4.ec2.redns.redis-cloud.com',
  port: 10775,
  username: "default",
  password: ENV_CONFIG.REDIS_PASSWORD as string,
};

const tutorQueue = new Queue('tutorQueue', {
  connection: redisConnection
});


// Function to add job to queue
export async function scheduleTutorReassignment(requestId: string, delay: number =  5 * 60 * 1000) {
    await tutorQueue.add("reassignTutor", { requestId }, { delay });
  }

// Worker to process tutor reassignment
new Worker(
  "tutorQueue", 
  async (job) => {
    const { requestId } = job.data;

    // Find the current tutor who was notified but hasn't responded
    const currentTutor = await prismadb.tutorRequestMatch.findFirst({
      where: { requestId, accepted: false, notifiedAt: { not: null } },
    });

    if (!currentTutor) return;

    // Find the next tutor
    const nextTutor = await prismadb.tutorRequestMatch.findFirst({
      where: { requestId, notifiedAt: null },
      orderBy: { createdAt: "asc" },
    });

    if (nextTutor) {
      // Notify the next tutor
      await prismadb.tutorRequestMatch.update({
        where: { id: nextTutor.id },
        data: { notifiedAt: new Date() },
      });

      // Schedule another check in 3 hours
      await scheduleTutorReassignment(requestId);
    }
  },
  {
    connection: redisConnection
  }
);