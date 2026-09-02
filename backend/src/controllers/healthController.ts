import { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse";
import { AiServiceClient } from "../services/aiServiceClient";

export const getHealth = async (req: Request, res: Response) => {
  const aiServiceOnline = await AiServiceClient.checkHealth();

  return ApiResponse.success(res, {
    status: "healthy",
    service: "PROJECT SETU Backend REST API",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    dependencies: {
      database: "MySQL (Prisma)",
      aiMicroservice: aiServiceOnline ? "online" : "unreachable",
    },
  });
};
