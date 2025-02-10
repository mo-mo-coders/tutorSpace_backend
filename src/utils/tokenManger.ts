import ENV_CONFIG from "../config/config";
import jwt, { SignOptions } from "jsonwebtoken";

interface TokenPayload {
    id: string;
    role: string;
}

export const createToken = (payload: TokenPayload, expiresIn: string) => {
    const secretKey = ENV_CONFIG.JWT_SECRET;

    if (!secretKey) {
        throw new Error("JWT_SECRET is not defined in the environment configuration");
    }

    const token = jwt.sign(payload, secretKey as string, {
        expiresIn,
    } as SignOptions);

    return token;
};