import axios from "axios";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { GrievanceAIAnalysisResult } from "../types";

export class AiServiceClient {
  private static client = axios.create({
    baseURL: env.AI_SERVICE_URL,
    timeout: 8000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  static async analyzeGrievance(
    title: string,
    description: string,
    location?: string,
    pincode?: string
  ): Promise<GrievanceAIAnalysisResult | null> {
    try {
      const response = await this.client.post<GrievanceAIAnalysisResult>("/api/v1/classify", {
        title,
        description,
        location,
        pincode,
      });
      return response.data;
    } catch (error: any) {
      logger.error(`AI Microservice classification call failed: ${error.message}`);
      // Return safe fallback defaults if AI service is temporarily unreachable
      return {
        category: "General Civic Query",
        suggested_department: "GENERAL_ADMINISTRATION",
        confidence_score: 0.5,
        priority: "MEDIUM",
        estimated_sla_hours: 48,
        extracted_keywords: ["general", "complaint"],
        sentiment: "NEUTRAL",
        is_urgent: false,
        summary: "Pending human officer triage",
      };
    }
  }

  static async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get("/api/v1/health");
      return response.status === 200;
    } catch {
      return false;
    }
  }
}
