import { Response, NextFunction } from "express";
import { analyticsService } from "../services/analyticsService";
import { ApiResponse } from "../utils/apiResponse";
import { AuthenticatedRequest } from "../types";
import { Priority, GrievanceStatus } from "@prisma/client";

export class AnalyticsController {
  /**
   * GET /api/v1/analytics/overview
   * Comprehensive aggregated analytics across all 11 dimensions
   */
  async getOverviewAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, departmentId, categoryId, priority, status } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        departmentId: departmentId as string | undefined,
        categoryId: categoryId as string | undefined,
        priority: priority as Priority | undefined,
        status: status as GrievanceStatus | undefined,
      };

      const result = await analyticsService.getOverviewAnalytics(filters);

      ApiResponse.success(res, result, "Aggregated analytics overview generated successfully");
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
export default analyticsController;
