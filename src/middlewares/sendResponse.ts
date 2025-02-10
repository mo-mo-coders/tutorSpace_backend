import ENV_CONFIG from "../config/config";
import { STATUS } from "../constants/status.constants";
import { Response } from "express";

interface ResponseData {
    status: keyof typeof STATUS;
    data?: [] | {};
    message?: string;
    error?: any;
    forceError?: boolean;
    [key: string]: any;
}

export const sendResponse = (res:Response, responseData:ResponseData) => {
    let error = undefined;

    if (responseData.error) {
        if (ENV_CONFIG.NODE_ENV === "development" || responseData.forceError) {
            error = responseData.error;
        } else {
            error =
                "The actual error has been hidden for security reasons, Please report the administrator for more information.";
        }
    }

    return res.status(responseData.status).json({
        ...STATUS[responseData.status || 200],
        ...responseData,
        error,
    });
};