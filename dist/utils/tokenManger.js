"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToken = void 0;
const config_1 = __importDefault(require("../config/config"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createToken = (payload, expiresIn) => {
    const secretKey = config_1.default.JWT_SECRET;
    if (!secretKey) {
        throw new Error("JWT_SECRET is not defined in the environment configuration");
    }
    const token = jsonwebtoken_1.default.sign(payload, secretKey, {
        expiresIn,
    });
    return token;
};
exports.createToken = createToken;
