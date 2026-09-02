import http from "http";
import app from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { prisma } from "./config/database";

const server = http.createServer(app);

const startServer = async () => {
  try {
    server.listen(env.PORT, env.HOST, () => {
      logger.info(`=============================================================`);
      logger.info(`🏛️  PROJECT SETU - Backend REST API Service Started`);
      logger.info(`📡 Port: ${env.PORT} | Host: ${env.HOST}`);
      logger.info(`🌐 Environment: ${env.NODE_ENV}`);
      logger.info(`🔗 Base URL: http://localhost:${env.PORT}`);
      logger.info(`🩺 Health Check: http://localhost:${env.PORT}/api/v1/health`);
      logger.info(`=============================================================`);
    });
  } catch (error: any) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Handles graceful server shutdown on system termination signals
 */
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown sequence...`);

  // Force close after 10s if graceful close hangs
  const forceShutdownTimer = setTimeout(() => {
    logger.error("Graceful shutdown timeout exceeded. Forcing process termination.");
    process.exit(1);
  }, 10000);

  server.close(async (err) => {
    if (err) {
      logger.error("Error closing HTTP server:", err);
      process.exit(1);
    }

    logger.info("HTTP connection listener closed.");

    try {
      await prisma.$disconnect();
      logger.info("Database connection closed cleanly.");
    } catch (dbErr) {
      logger.error("Error disconnecting Prisma database client:", dbErr);
    } finally {
      clearTimeout(forceShutdownTimer);
      logger.info("PROJECT SETU Backend shutdown complete. Goodbye.");
      process.exit(0);
    }
  });
};

// Process Signal Listeners
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Uncaught Exception and Unhandled Rejection Listeners
process.on("uncaughtException", (error: Error) => {
  logger.error("CRITICAL: Uncaught Exception detected:", error);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason: any) => {
  logger.error("CRITICAL: Unhandled Promise Rejection detected:", reason);
  gracefulShutdown("unhandledRejection");
});

// Boot the server
startServer();

export default server;
