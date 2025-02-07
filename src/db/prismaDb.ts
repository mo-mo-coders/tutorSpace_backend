import { PrismaClient } from '@prisma/client';

// Declare a global variable to extend the NodeJS global type
declare global {
  var prisma: PrismaClient | undefined;
}

let prismadb: PrismaClient;

try {
  if (process.env.NODE_ENV === 'production') {
    prismadb = new PrismaClient();
  } else {
    // Check if prisma exists on global
    if (!global.prisma) {
      global.prisma = new PrismaClient({
        log: ['query', 'error', 'warn'],
      });
    }
    prismadb = global.prisma;
  }
} catch (error) {
  console.error('Prisma Client Error:', error);
  throw new Error('Failed to initialize Prisma Client. Run "npx prisma generate" first.');
}

export default prismadb;
