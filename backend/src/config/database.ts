import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";
import { env } from "./env";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: env.isDevelopment ? ["query", "error", "warn"] : ["error"],
  });

if (!env.isProduction) {
  global.prisma = prisma;
}

/**
 * Health check helper to verify database connectivity with timeout
 */
export const checkDatabaseConnection = async (timeoutMs: number = 3000): Promise<{
  connected: boolean;
  responseTimeMs: number;
  error?: string;
}> => {
  const start = Date.now();
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database connection timed out")), timeoutMs)
    );

    const queryPromise = prisma.$queryRaw`SELECT 1 as health_check`;

    await Promise.race([queryPromise, timeoutPromise]);
    const responseTimeMs = Date.now() - start;
    return { connected: true, responseTimeMs };
  } catch (error: any) {
    const responseTimeMs = Date.now() - start;
    logger.warn(`Database connection check failed: ${error.message}`);
    return {
      connected: false,
      responseTimeMs,
      error: error.message || "Connection refused",
    };
  }
};

export default prisma;
