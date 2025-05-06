"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIntegerPart = void 0;
const getIntegerPart = (str) => {
    const digitsOnly = str.replace(/\D/g, ""); // Remove all non-digit characters
    return parseInt(digitsOnly, 10) || 0; // Fallback to 0 if parsing fails
};
exports.getIntegerPart = getIntegerPart;
