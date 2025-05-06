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
exports.verifyToken = void 0;
const catchAsyncErrors_1 = __importDefault(require("../middlewares/catchAsyncErrors"));
const sendResponse_1 = require("../middlewares/sendResponse");
const config_1 = __importDefault(require("../config/config"));
const prismaDb_1 = __importDefault(require("../db/prismaDb"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.verifyToken = (0, catchAsyncErrors_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.token || "";
    console.log("token is", token);
    if (!token)
        return res.status(401).json({ message: "Unauthorized" });
    const decoded = jsonwebtoken_1.default.verify(token, config_1.default.JWT_SECRET);
    req.cookies.user = decoded;
    console.log(req.cookies.user);
    const student = yield prismaDb_1.default.student.findFirst({
        where: {
            id: decoded.id,
        },
    });
    const tutor = yield prismaDb_1.default.tutor.findFirst({
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
}));
