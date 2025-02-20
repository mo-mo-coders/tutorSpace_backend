import { STATUS } from "../constants/status.constants";

export interface ResponseData {
    status: keyof typeof STATUS;
    data?: [] | {};
    message?: string;
    error?: any;
    forceError?: boolean;
    [key: string]: any;
}