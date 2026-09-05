import { Request, Response } from "express";
import { schemeService } from "../services/schemeService";
import { ApiResponse } from "../utils/apiResponse";

export class SchemeController {
  /**
   * GET /api/v1/schemes
   */
  async getSchemes(req: Request, res: Response): Promise<void> {
    try {
      const { q, category, state, limit, offset } = req.query;
      const result = await schemeService.getSchemes({
        query: q as string,
        category: category as string,
        state: state as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      ApiResponse.success(res, result, "Government schemes retrieved successfully");
    } catch (error: any) {
      ApiResponse.error(res, error.message || "Failed to retrieve schemes", 500);
    }
  }

  /**
   * GET /api/v1/schemes/:idOrSlug
   */
  async getSchemeDetails(req: Request, res: Response): Promise<void> {
    try {
      const { idOrSlug } = req.params;
      const scheme = await schemeService.getSchemeDetails(idOrSlug);
      if (!scheme) {
        ApiResponse.error(res, "Government scheme not found", 404);
        return;
      }

      ApiResponse.success(res, { scheme }, "Scheme details retrieved successfully");
    } catch (error: any) {
      ApiResponse.error(res, error.message || "Failed to retrieve scheme details", 500);
    }
  }

  /**
   * POST /api/v1/schemes/:idOrSlug/check-eligibility
   */
  async checkEligibility(req: Request, res: Response): Promise<void> {
    try {
      const { idOrSlug } = req.params;
      const evaluation = await schemeService.checkEligibility(idOrSlug, req.body);
      ApiResponse.success(res, evaluation, "Eligibility check completed successfully");
    } catch (error: any) {
      ApiResponse.error(res, error.message || "Failed to perform eligibility check", 400);
    }
  }
}

export const schemeController = new SchemeController();
