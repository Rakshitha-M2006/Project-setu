import app from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import prisma from "./config/db";

const server = app.listen(env.PORT, () => {
  logger.info(`=======================================================`);
  logger.info(`🚀 PROJECT SETU Backend running on port: ${env.PORT}`);
  logger.info(`🌐 Environment: ${env.NODE_ENV}`);
  logger.info(`🔗 API Base: http://localhost:${env.PORT}/api/v1`);
  logger.info(`=======================================================`);
});

const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    logger.info("HTTP server closed.");
    await prisma.$disconnect();
    logger.info("Database connection disconnected.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
