"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const studentRouter_1 = __importDefault(require("./studentRouter"));
const tutorRouter_1 = __importDefault(require("./tutorRouter"));
const tutorRequestRouter_1 = __importDefault(require("./tutorRequestRouter"));
const appRouter = (0, express_1.Router)();
appRouter.use("/student", studentRouter_1.default);
appRouter.use("/tutor", tutorRouter_1.default);
appRouter.use("/tutorRequest", tutorRequestRouter_1.default);
exports.default = appRouter;
