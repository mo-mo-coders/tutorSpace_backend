"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (theFunc) => {
    return async (req, res, next) => {
        try {
            await Promise.resolve(theFunc(req, res, next));
        }
        catch (error) {
            console.error('AsyncError:', error);
            next(error);
        }
    };
};
