"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIntegerPart = void 0;
const getIntegerPart = (str) => {
    const digitsOnly = str.replace(/\D/g, "");
    return parseInt(digitsOnly, 10) || 0;
};
exports.getIntegerPart = getIntegerPart;
