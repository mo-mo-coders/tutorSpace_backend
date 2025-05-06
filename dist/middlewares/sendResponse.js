"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const config_1 = __importDefault(require("../config/config"));
const status_constants_1 = require("../constants/status.constants");
const sendResponse = (res, responseData) => {
    let error = undefined;
    if (responseData.error) {
        if (config_1.default.NODE_ENV === "development" || responseData.forceError) {
            error = responseData.error;
        }
        else {
            error =
                "The actual error has been hidden for security reasons, Please report the administrator for more information.";
        }
    }
    return res.status(responseData.status).json(Object.assign(Object.assign(Object.assign({}, status_constants_1.STATUS[responseData.status || 200]), responseData), { error }));
};
exports.sendResponse = sendResponse;
