import { Request, Response, NextFunction } from "express";
import { assistantService } from "../services/assistantService";
import { ApiResponse } from "../utils/apiResponse";
import { AuthenticatedRequest } from "../types";

export class AssistantController {
  /**
   * POST /api/v1/assistant/chat
   * Process natural language query from citizen
   */
  async chat(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { message, language } = req.body;
      const userId = req.user ? req.user.id : undefined;

      if (!message || typeof message !== "string" || !message.trim()) {
        res.status(400).json({
          success: false,
          message: "A message string is required.",
        });
        return;
      }

      const response = await assistantService.processQuery(message, language || "en", userId);

      ApiResponse.success(res, response, "Assistant response generated");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/assistant/quick-actions
   * Fetch context suggestions
   */
  async getQuickActions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actions = [
        { label: "Income Certificate", prompt: "How do I apply for an Income Certificate?" },
        { label: "Caste Certificate", prompt: "What documents are required for a Caste Certificate?" },
        { label: "Residence / Domicile Certificate", prompt: "How to get a Residence / Domicile Certificate?" },
        { label: "Report Broken Water Pipeline", prompt: "Report broken water pipeline causing street flooding" },
        { label: "Report Road Potholes", prompt: "Lodge grievance about dangerous road potholes in my area" },
        { label: "Report Power Outage", prompt: "Report electrical fluctuation and power outage in our sector" },
        { label: "Track My Grievance Status", prompt: "Check status of my recent grievances" },
      ];

      ApiResponse.success(res, { actions }, "Quick actions retrieved");
    } catch (error) {
      next(error);
    }
  }
}

export const assistantController = new AssistantController();
export default assistantController;
