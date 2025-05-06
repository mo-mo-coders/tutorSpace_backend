"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = void 0;
const authorizeRole = (role) => {
    return (req, res, next) => {
        if (!req.cookies.user) {
            res.status(401).json({ error: "Unauthorized: No User Found" });
            return; // End the function with void
        }
        if (req.cookies.user.role !== role) {
            res.status(403).json({ error: "Forbidden: You do not have permission" });
            return; // End the function with void
        }
        next();
    };
};
exports.authorizeRole = authorizeRole;
