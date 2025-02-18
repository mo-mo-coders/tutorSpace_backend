import { Router } from "express";
import { createStudent , loginStudent , createStudentInfo , getStudentInfo , updateStudentInfo , deleteStudentInfo } from "../controllers/studentController";
import { verifyToken } from '../middlewares/requireAuth';
import { authorizeRole } from "../middlewares/authorizeRole";

const studentRouter = Router();

studentRouter.post("/signup", createStudent);
studentRouter.post("/login", loginStudent);
studentRouter.post("/:student_id/createinfo",verifyToken, authorizeRole("STUDENT"), createStudentInfo);
studentRouter.get("/:student_id/getinfo",verifyToken, authorizeRole("STUDENT") , getStudentInfo);
studentRouter.put("/:id/updateinfo",verifyToken, authorizeRole("STUDENT"), updateStudentInfo);
studentRouter.delete("/:id/deleteinfo",verifyToken, authorizeRole("STUDENT"), deleteStudentInfo);

export default studentRouter;