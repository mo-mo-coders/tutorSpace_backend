import { Router } from "express";
import { verifyToken } from '../middlewares/requireAuth';
import { authorizeRole } from "../middlewares/authorizeRole";

import { getMatchedTutors , createTutorRequest , updateTutorRequest } from "../controllers/tutorRequestController";

const tutorRequestRouter = Router();

tutorRequestRouter.get("/:student_id/getmatchedtutors",verifyToken, getMatchedTutors);
tutorRequestRouter.post("/:student_id/createRequest",verifyToken , createTutorRequest);
tutorRequestRouter.put("/:request_id/updaterequest",verifyToken,authorizeRole("TUTOR"), updateTutorRequest);

export default tutorRequestRouter;