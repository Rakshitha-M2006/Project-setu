import axios from "axios";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { GrievanceAIAnalysisResult } from "../types";

export class AiServiceClient {
  private static client = axios.create({
    baseURL: env.AI_SERVICE_URL,
    timeout: env.AI_REQUEST_TIMEOUT_MS || 5000,
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "ProjectSetu-Backend/1.0",
    },
  });

  /**
   * Classify grievance text via Python FastAPI AI Microservice
   * Falls back gracefully if AI service is offline or unreachable.
   */
  static async analyzeGrievance(
    title: string,
    description: string,
    location?: string,
    pincode?: string
  ): Promise<GrievanceAIAnalysisResult> {
    const startTime = Date.now();
    try {
      logger.info(`[AI Client] Dispatching grievance for NLP triage: "${title.slice(0, 50)}..."`);

      // 1. Call primary POST /predict endpoint
      const response = await this.client.post("/predict", {
        title,
        description,
        address_text: location,
        pincode,
        text: `${title} ${description}`,
      });

      const data = response.data;
      const durationMs = Date.now() - startTime;

      // Extract and normalize response
      const confidence = typeof data.confidence === "number" ? data.confidence : (data.confidence_score || 0.5);
      const isBelowThreshold = confidence < env.AI_CONFIDENCE_THRESHOLD;
      const requiresHumanReview = data.requires_human_review ?? isBelowThreshold;

      logger.info(
        `[AI Client] Prediction complete in ${durationMs}ms -> Dept: ${data.department_code || data.suggested_department}, Priority: ${data.priority}, Conf: ${(confidence * 100).toFixed(1)}%, HumanReview: ${requiresHumanReview}`
      );

      return {
        category: data.category || "General Public Grievance",
        department: data.department || "General Administration Department",
        department_code: data.department_code || data.suggested_department || "GENERAL_ADMINISTRATION",
        suggested_department: data.department_code || data.suggested_department || "GENERAL_ADMINISTRATION",
        issue_type: data.issue_type || "General Civic Issue",
        confidence_score: confidence,
        priority: (data.priority as any) || "MEDIUM",
        estimated_sla_hours: data.suggested_sla_hours || data.estimated_sla_hours || 48,
        extracted_keywords: Array.isArray(data.extracted_keywords) ? data.extracted_keywords : [],
        sentiment: data.sentiment || "NEUTRAL",
        is_urgent: Boolean(data.is_urgent),
        summary: data.summary || "Automated NLP classification applied",
        requires_human_review: requiresHumanReview,
        is_below_threshold: isBelowThreshold,
        model_version: data.model_version || "1.0.0-nlp-rules",
        raw_inference: data.raw_inference || {},
      };
    } catch (error: any) {
      const durationMs = Date.now() - startTime;
      logger.warn(
        `[AI Client] AI Microservice unreachable (${error.code || error.message}) after ${durationMs}ms. Applying safe failover defaults.`
      );

      // Return safe fallback defaults - Grievance MUST NEVER fail permanently or disappear
      return {
        category: "General Civic Query / Administration",
        department: "General Administration Department",
        department_code: "GENERAL_ADMINISTRATION",
        suggested_department: "GENERAL_ADMINISTRATION",
        issue_type: "Unclassified Civic Complaint",
        confidence_score: 0.5,
        priority: "MEDIUM",
        estimated_sla_hours: 48,
        extracted_keywords: ["unclassified", "manual-triage-required"],
        sentiment: "NEUTRAL",
        is_urgent: false,
        summary: "Pending manual human officer triage (AI service failover)",
        requires_human_review: true,
        is_below_threshold: true,
        model_version: "failover-rule-fallback",
        raw_inference: {
          error: error.message,
          failover_applied_at: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Health Check diagnostic for AI Microservice
   */
  static async checkHealth(): Promise<{ status: "connected" | "unreachable"; responseTimeMs?: number; endpoint: string }> {
    const startTime = Date.now();
    try {
      const response = await this.client.get("/api/v1/health");
      const duration = Date.now() - startTime;
      return {
        status: response.status === 200 ? "connected" : "unreachable",
        responseTimeMs: duration,
        endpoint: env.AI_SERVICE_URL,
      };
    } catch {
      return {
        status: "unreachable",
        endpoint: env.AI_SERVICE_URL,
      };
    }
  }
}

export default AiServiceClient;
