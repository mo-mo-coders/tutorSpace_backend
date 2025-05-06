"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
let prismadb;
try {
    if (process.env.NODE_ENV === 'production') {
        prismadb = new client_1.PrismaClient();
    }
    else {
        // Check if prisma exists on global
        if (!global.prisma) {
            global.prisma = new client_1.PrismaClient({
                log: ['query', 'error', 'warn'],
            });
        }
        prismadb = global.prisma;
    }
}
catch (error) {
    console.error('Prisma Client Error:', error);
    throw new Error('Failed to initialize Prisma Client. Run "npx prisma generate" first.');
}
exports.default = prismadb;
