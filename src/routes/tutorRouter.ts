import { Router } from "express";
import { verifyToken } from '../middlewares/requireAuth';
import { authorizeRole } from "../middlewares/authorizeRole";
import { createTutor , loginTutor , createTutorInfo , getTutorInfo , updateTutorInfo , deleteTutorInfo } from "../controllers/tutorController";

const tutorRouter = Router();

tutorRouter.post("/signup", createTutor);
tutorRouter.post("/login", loginTutor);
tutorRouter.post("/:tutor_id/createinfo",verifyToken, authorizeRole("TUTOR"), createTutorInfo);
tutorRouter.get("/:tutor_id/getinfo",verifyToken, authorizeRole("TUTOR") , getTutorInfo);
tutorRouter.put("/:id/updateinfo",verifyToken, authorizeRole("TUTOR"), updateTutorInfo);
tutorRouter.delete("/:id/deleteinfo",verifyToken, authorizeRole("TUTOR"), deleteTutorInfo);

export default tutorRouter;