import axios from "axios";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { GrievanceAIAnalysisResult } from "../types";
import { OllamaService } from "./ollamaService";

export class AiServiceClient {
  private static client = axios.create({
    baseURL: env.AI_SERVICE_URL,
    timeout: 3000,
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "ProjectSetu-Backend/1.0",
      "X-Internal-API-Key": env.INTERNAL_API_SECRET,
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
        `[AI Client] AI Microservice unreachable (${error.code || error.message}) after ${durationMs}ms. Attempting Ollama local LLM triage...`
      );

      // Attempt local classification with Ollama (gemma3)
      try {
        const ollamaClassification = await this.classifyWithOllama(title, description, location, pincode);
        if (ollamaClassification) {
          logger.info(`[AI Client] Successfully classified grievance using local Ollama model (${ollamaClassification.category} -> ${ollamaClassification.department})`);
          return ollamaClassification;
        }
      } catch (ollamaErr: any) {
        logger.warn(`[AI Client] Ollama local triage fallback failed: ${ollamaErr.message}`);
      }

      // Return safe fallback defaults if both AI microservice and Ollama are unavailable
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
   * Classify grievance using local Ollama instance (gemma3)
   */
  private static async classifyWithOllama(
    title: string,
    description: string,
    location?: string,
    pincode?: string
  ): Promise<GrievanceAIAnalysisResult | null> {
    try {
      const prompt = `Classify this citizen complaint for Indian Government public services. Output ONLY a valid JSON object:
Title: ${title.slice(0, 100)}
Description: ${description.slice(0, 250)}
Location: ${location || "Not provided"}
Pincode: ${pincode || "Not provided"}

JSON schema:
{
  "category": "Roads & Infrastructure" | "Water Supply & Sanitation" | "Electricity & Power" | "Solid Waste Management" | "Revenue & Land Administration" | "Public Health" | "General Public Grievance",
  "department": "Public Works Department" | "Water Supply & Sewerage Board" | "Electricity Board" | "Municipal Corporation" | "Revenue Department" | "Health & Family Welfare" | "General Administration",
  "department_code": "PWD" | "WATER" | "POWER" | "MUNICIPAL" | "REVENUE" | "HEALTH" | "GENERAL_ADMINISTRATION",
  "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  "is_urgent": boolean,
  "summary": "1-sentence summary",
  "extracted_keywords": ["keyword1", "keyword2"]
}`;

      const res = await OllamaService.generate(prompt, "You are an AI civic triage officer. Output strictly valid JSON without explanation or formatting fences.", {
        timeoutMs: 25000,
        numPredict: 80,
        temperature: 0.1,
      });

      if (!res.success || !res.response) {
        return null;
      }

      const cleanJson = res.response
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleanJson);
      const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
      const priority = validPriorities.includes(parsed.priority) ? parsed.priority : "MEDIUM";

      return {
        category: parsed.category || "General Public Grievance",
        department: parsed.department || "General Administration Department",
        department_code: parsed.department_code || "GENERAL_ADMINISTRATION",
        suggested_department: parsed.department_code || "GENERAL_ADMINISTRATION",
        issue_type: parsed.category || "Civic Grievance",
        confidence_score: 0.9,
        priority: priority as any,
        estimated_sla_hours: priority === "URGENT" ? 24 : priority === "HIGH" ? 36 : 48,
        extracted_keywords: Array.isArray(parsed.extracted_keywords) ? parsed.extracted_keywords : ["ollama-triaged"],
        sentiment: "NEGATIVE",
        is_urgent: Boolean(parsed.is_urgent || priority === "URGENT"),
        summary: parsed.summary || title,
        requires_human_review: false,
        is_below_threshold: false,
        model_version: `ollama-${res.model}`,
        raw_inference: {
          triageSource: "ollama-local-llm",
          model: res.model,
          durationMs: res.durationMs,
        },
      };
    } catch (err: any) {
      logger.warn(`[AI Client] Ollama grievance parsing skipped: ${err.message}`);
      return null;
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
