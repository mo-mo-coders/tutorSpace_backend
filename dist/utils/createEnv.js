"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const zod_validation_error_1 = require("zod-validation-error");
const createEnv = (env) => {
    const envKeys = Object.keys(env);
    const parsedEnv = envKeys.reduce((acc, key) => {
        const schema = createSchema(env[key], key);
        const { value } = env[key];
        let parsed = "";
        try {
            parsed = schema.parse(value);
        }
        catch (e) {
            const message = (0, zod_validation_error_1.fromError)(e).toString();
            console.error("\nENVIRONMENT VARIABLES ERROR:");
            console.error(message);
        }
        acc[key] = parsed;
        return acc;
    }, {});
    return parsedEnv;
};
const createSchema = (env, key) => {
    const { required = true, type = "string", isUrl = false } = env;
    // if the value is not provided, throw an error
    const schema = zod_1.z
        .string({
        message: `${key} must be a string`,
    })
        .refine((val) => {
        if (required && !val) {
            return `${key} is required`;
        }
        if (type === "number" && isNaN(Number(val))) {
            return `${key} must be a number`;
        }
        if (type === "boolean" && !["true", "false"].includes(val)) {
            return `${key} must be a boolean`;
        }
        if (isUrl && !val.startsWith("http")) {
            return `${key} must be a URL`;
        }
        if (type === "array" && val.split(",").length < 1) {
            return `${key} must be a comma separated string`;
        }
        return true;
    })
        .transform((val) => {
        if (type === "number") {
            return Number(val);
        }
        if (type === "boolean") {
            return val === "true";
        }
        if (type === "array") {
            return val.split(",").map((v) => v.trim());
        }
        return val;
    })
        .transform((val) => {
        if (isUrl) {
            // remove trailing slash
            if (typeof val === "string") {
                return val.replace(/\/$/, "");
            }
            if (Array.isArray(val)) {
                return val.map((v) => v.replace(/\/$/, ""));
            }
        }
        return val;
    });
    return schema;
};
exports.default = createEnv;
