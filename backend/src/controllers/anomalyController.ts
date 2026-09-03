import { Response, NextFunction } from "express";
import { anomalyDetectionService } from "../services/anomaly/anomalyDetectionService";
import { ApiResponse } from "../utils/apiResponse";
import { AuthenticatedRequest } from "../types";
import { AnomalyStatus, AnomalySeverity } from "@prisma/client";

export class AnomalyController {
  /**
   * 1. GET /api/v1/anomalies
   * List detected anomalies with filters and metrics
   */
  async getAnomalies(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, severity, departmentId, page, limit } = req.query;

      const result = await anomalyDetectionService.getAnomalies({
        status: status as AnomalyStatus | "ALL",
        severity: severity as AnomalySeverity | "ALL",
        departmentId: departmentId as string | "ALL",
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 15,
      });

      ApiResponse.success(res, result, "Anomalies retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * 2. POST /api/v1/anomalies/scan
   * Trigger an on-demand statistical anomaly scan
   */
  async triggerScan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await anomalyDetectionService.runAnomalyScan();
      ApiResponse.success(res, result, "Statistical anomaly scan executed successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * 3. PATCH /api/v1/anomalies/:id/status
   * Update anomaly status (OPEN, INVESTIGATING, RESOLVED, FALSE_POSITIVE)
   */
  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, investigationNotes } = req.body;
      const actorId = req.user!.id;

      const updated = await anomalyDetectionService.updateStatus(
        id,
        status as AnomalyStatus,
        investigationNotes,
        actorId
      );

      ApiResponse.success(res, updated, `Anomaly status updated to ${status}`);
    } catch (error) {
      next(error);
    }
  }
}

export const anomalyController = new AnomalyController();
export default anomalyController;
