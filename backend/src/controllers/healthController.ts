import { Request, Response, NextFunction } from "express";
import { healthService } from "../services/healthService";
import { ApiResponse } from "../utils/apiResponse";
import { HttpStatus } from "../utils/httpStatusCodes";

export class HealthController {
  /**
   * GET /api/v1/health
   * Performs real-time readiness and liveness inspection across all system subsystems.
   */
  async getHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const healthData = await healthService.getHealthStatus();
      const statusCode = healthData.status === "healthy" ? HttpStatus.OK : HttpStatus.OK; // Return 200 with degraded metadata so monitors can read JSON

      ApiResponse.success(
        res,
        healthData,
        `Service is operating in ${healthData.status} mode`,
        statusCode
      );
    } catch (error) {
      next(error);
    }
  }
}

export const healthController = new HealthController();
export default healthController;
