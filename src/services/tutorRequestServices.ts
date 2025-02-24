import { Queue } from "bullmq";

const tutorQueue = new Queue("tutorQueue");


// Function to add job to queue
export async function scheduleTutorReassignment(requestId: string, delay: number = 3 * 60 * 60 * 1000) {
    await tutorQueue.add("reassignTutor", { requestId }, { delay });
  }