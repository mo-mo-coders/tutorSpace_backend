import createEnv from "../utils/createEnv";
import { config } from "dotenv";

config();


const ENV_CONFIG = createEnv({
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
    },
});

export default ENV_CONFIG;