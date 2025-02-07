import { z } from "zod";
import { fromError } from "zod-validation-error";

interface EnvConfig {
    value: string;
    required?: boolean;
    type?: "string" | "number" | "boolean" | "array";
    isUrl?: boolean;
}

interface ParsedEnv {
    [key: string]: string | number | boolean | string[];
}

const createEnv = (env: { [key: string]: EnvConfig }): ParsedEnv => {
    const envKeys = Object.keys(env);

    const parsedEnv = envKeys.reduce((acc: ParsedEnv, key: string) => {
        const schema = createSchema(env[key], key);
        const { value } = env[key];

        let parsed: string | number | boolean | string[] = "";

        try {
            parsed = schema.parse(value);
        } catch (e) {
            const message = fromError(e).toString();
            console.error("\nENVIRONMENT VARIABLES ERROR:");
            console.error(message);
        }

        acc[key] = parsed;
        return acc;
    }, {} as ParsedEnv);

    return parsedEnv;
};

const createSchema = (env: EnvConfig, key: string) => {
    const { required = true, type = "string", isUrl = false } = env;

    // if the value is not provided, throw an error
    const schema = z
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

export default createEnv;