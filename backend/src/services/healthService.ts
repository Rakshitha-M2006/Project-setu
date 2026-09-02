import os from "os";
import { APP_METADATA } from "../config/constants";
import { env } from "../config/env";
import { healthRepository } from "../repositories/healthRepository";
import { AiServiceClient } from "./aiServiceClient";
import { HealthCheckResponse } from "../types";

export class HealthService {
  private startTime = Date.now();

  private formatUptime(uptimeSeconds: number): string {
    const days = Math.floor(uptimeSeconds / (3600 * 24));
    const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.join(" ");
  }

  async getHealthStatus(): Promise<HealthCheckResponse> {
    const uptimeSeconds = Math.floor(process.uptime());
    const memory = process.memoryUsage();

    // Check Database Health
    const dbResult = await healthRepository.pingDatabase();

    // Check AI Microservice Health
    const aiStartTime = Date.now();
    const isAiOnline = await AiServiceClient.checkHealth();
    const aiResponseTimeMs = Date.now() - aiStartTime;

    // Determine overall service status
    const isHealthy = dbResult.connected && isAiOnline;
    const isDegraded = !dbResult.connected || !isAiOnline;

    const status: "healthy" | "degraded" = isHealthy ? "healthy" : "degraded";

    return {
      status,
      service: APP_METADATA.NAME,
      version: APP_METADATA.VERSION,
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: uptimeSeconds,
        formatted: this.formatUptime(uptimeSeconds),
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        memoryUsage: {
          rssMb: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
          heapTotalMb: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
          heapUsedMb: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
        },
      },
      dependencies: {
        database: {
          status: dbResult.connected ? "connected" : "disconnected",
          engine: "MySQL 8.0+ (Prisma ORM)",
          responseTimeMs: dbResult.responseTimeMs,
          error: dbResult.error,
        },
        aiMicroservice: {
          status: isAiOnline ? "connected" : "unreachable",
          endpoint: env.AI_SERVICE_URL,
          responseTimeMs: isAiOnline ? aiResponseTimeMs : undefined,
        },
      },
    };
  }
}

export const healthService = new HealthService();
export default healthService;
