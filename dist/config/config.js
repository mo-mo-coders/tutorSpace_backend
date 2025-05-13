"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createEnv_1 = __importDefault(require("../utils/createEnv"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const ENV_CONFIG = (0, createEnv_1.default)({
    DATABASE_URI: {
        value: process.env.DATABASE_URI || "",
        required: true,
    },
    PORT: {
        value: process.env.PORT || "5000",
        required: false,
        type: "number",
    },
    FRONTEND_URL: {
        value: process.env.FRONTEND_URL || "",
        required: true,
        type: "string",
        isUrl: true,
    },
    NODE_ENV: {
        value: process.env.NODE_ENV || "development",
        required: false,
    },
    JWT_SECRET: {
        value: process.env.JWT_SECRET || "",
        required: true,
    },
    MAX_REQUEST_SIZE: {
        value: process.env.MAX_REQUEST_SIZE || "10mb",
        required: false,
    },
    REDIS_PASSWORD: {
        value: process.env.redis_pw || "",
        required: true,
        type: "string",
    }
});
exports.default = ENV_CONFIG;
