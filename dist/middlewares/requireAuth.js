"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const catchAsyncErrors_1 = __importDefault(require("../middlewares/catchAsyncErrors"));
const sendResponse_1 = require("../middlewares/sendResponse");
const config_1 = __importDefault(require("../config/config"));
const prismaDb_1 = __importDefault(require("../db/prismaDb"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.verifyToken = (0, catchAsyncErrors_1.default)(async (req, res, next) => {
    const token = req.cookies.token || "";
    console.log("token is", token);
    if (!token)
        return res.status(401).json({ message: "Unauthorized" });
    const decoded = jsonwebtoken_1.default.verify(token, config_1.default.JWT_SECRET);
    req.cookies.user = decoded;
    console.log(req.cookies.user);
    const student = await prismaDb_1.default.student.findFirst({
        where: {
            id: decoded.id,
        },
    });
    const tutor = await prismaDb_1.default.tutor.findFirst({
        where: {
            id: decoded.id,
        },
    });
    if (!student && !tutor) {
        return (0, sendResponse_1.sendResponse)(res, {
            status: 404,
            message: "You are not authorized to access this route",
        });
    }
    next();
});
