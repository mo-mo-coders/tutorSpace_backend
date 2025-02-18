import catchAsyncErrors from "../middlewares/catchAsyncErrors";
import { Request, Response ,NextFunction } from "express";
import { sendResponse } from "../middlewares/sendResponse";
import ENV_CONFIG from "../config/config";

import prismadb from "../db/prismaDb";

import jwt , {JwtPayload} from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
    id: string;
  }

export const verifyToken = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token || "";
    console.log("token is",token);
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, ENV_CONFIG.JWT_SECRET as string) as DecodedToken;
    req.cookies.user=decoded;
    console.log(req.cookies.user);
    
    const student = await prismadb.student.findFirst({
        where: {
          id: decoded.id,
        },
      });
      console.log("admin", student);
      if (!student) {
        return sendResponse(res, {
          status: 404,
          message: "You are not authorized to access this route",
        });
      }
      next();
});
