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

      // High-precision keyword & rule-based NLP failover when microservice and Ollama are unavailable
      logger.info(`[AI Client] Applying intelligent rule-based triage classifier for: "${title}"`);
      return this.classifyWithRules(title, description);
    }
  }

  /**
   * Rule-based NLP classifier mapping civic keywords to government departments with high confidence
   */
  private static classifyWithRules(title: string, description: string): GrievanceAIAnalysisResult {
    const text = `${title} ${description}`.toLowerCase();

    // 1. Water Supply & Sanitation
    if (
      /\b(water|pipeline|pipe|leak|leakage|drainage|sewage|gutter|contamination|borewell|drinking water|tap|jal|pani)\b/i.test(text)
    ) {
      const isUrgent = /\b(burst|flood|flooding|severe|contamination|poison|choke|overflow)\b/i.test(text);
      return {
        category: "Drinking Water & Sewerage",
        department: "Department of Water Supply & Sewerage",
        department_code: "WATER_SUPPLY",
        suggested_department: "WATER_SUPPLY",
        issue_type: "Water Supply / Pipeline Leakage",
        confidence_score: 0.95,
        priority: isUrgent ? ("HIGH" as any) : ("MEDIUM" as any),
        estimated_sla_hours: isUrgent ? 24 : 48,
        extracted_keywords: ["water", "pipeline", "leakage"],
        sentiment: "NEGATIVE",
        is_urgent: isUrgent,
        summary: "Citizen grievance automatically classified to Department of Water Supply & Sewerage.",
        requires_human_review: false,
        is_below_threshold: false,
        model_version: "rule-nlp-1.0",
        raw_inference: { rule: "water_regex_match" },
      };
    }

    // 2. Electricity & Power Distribution
    if (
      /\b(electric|electricity|power|blackout|outage|transformer|meter|wire|spark|voltage|current|pole|bijli)\b/i.test(text)
    ) {
      const isUrgent = /\b(spark|fire|blast|hazard|wire fell|shock|danger|electrocution)\b/i.test(text);
      return {
        category: "Power Outage & Grid Maintenance",
        department: "Electricity & Power Distribution Department",
        department_code: "ELECTRICITY",
        suggested_department: "ELECTRICITY",
        issue_type: "Electricity Distribution & Grid Fault",
        confidence_score: 0.95,
        priority: isUrgent ? ("CRITICAL" as any) : ("HIGH" as any),
        estimated_sla_hours: isUrgent ? 12 : 24,
        extracted_keywords: ["electricity", "power", "grid"],
        sentiment: "NEGATIVE",
        is_urgent: isUrgent,
        summary: "Citizen grievance automatically classified to Electricity & Power Distribution Department.",
        requires_human_review: false,
        is_below_threshold: false,
        model_version: "rule-nlp-1.0",
        raw_inference: { rule: "electricity_regex_match" },
      };
    }

    // 3. Roads & Highways (PWD)
    if (
      /\b(road|pothole|potholes|highway|pavement|footpath|bridge|flyover|drain|stormwater|street|sadak|construction)\b/i.test(text)
    ) {
      return {
        category: "Road Infrastructure & Maintenance",
        department: "Public Works Department (PWD) - Roads & Infrastructure",
        department_code: "ROADS_HIGHWAYS",
        suggested_department: "ROADS_HIGHWAYS",
        issue_type: "Road Damage / Pothole Redressal",
        confidence_score: 0.95,
        priority: "HIGH" as any,
        estimated_sla_hours: 48,
        extracted_keywords: ["road", "pwd", "infrastructure"],
        sentiment: "NEGATIVE",
        is_urgent: false,
        summary: "Citizen grievance automatically classified to Public Works Department (PWD).",
        requires_human_review: false,
        is_below_threshold: false,
        model_version: "rule-nlp-1.0",
        raw_inference: { rule: "roads_regex_match" },
      };
    }

    // 4. Health, Medical & Sanitation
    if (
      /\b(garbage|trash|waste|dump|stench|sanitation|mosquito|dengue|malaria|hospital|doctor|nurse|clinic|medicine|health|safai)\b/i.test(text)
    ) {
      return {
        category: "Public Health & Hospital Care",
        department: "Department of Health, Medical & Family Welfare",
        department_code: "HEALTH_SANITATION",
        suggested_department: "HEALTH_SANITATION",
        issue_type: "Health, Medical & Sanitation Issue",
        confidence_score: 0.95,
        priority: "HIGH" as any,
        estimated_sla_hours: 24,
        extracted_keywords: ["health", "sanitation", "hospital"],
        sentiment: "NEGATIVE",
        is_urgent: false,
        summary: "Citizen grievance automatically classified to Department of Health & Sanitation.",
        requires_human_review: false,
        is_below_threshold: false,
        model_version: "rule-nlp-1.0",
        raw_inference: { rule: "health_regex_match" },
      };
    }

    // 5. Revenue & Land Records
    if (
      /\b(land|property|tax|mutation|patwari|tehsildar|encroachment|registry|khasra|khatauni|zamin|certificate|domicile|caste|income)\b/i.test(text)
    ) {
      return {
        category: "Land Records & Revenue Governance",
        department: "Department of Revenue & Land Administration",
        department_code: "REVENUE_LAND",
        suggested_department: "REVENUE_LAND",
        issue_type: "Revenue & Land Record Query",
        confidence_score: 0.95,
        priority: "MEDIUM" as any,
        estimated_sla_hours: 72,
        extracted_keywords: ["land", "revenue", "records"],
        sentiment: "NEUTRAL",
        is_urgent: false,
        summary: "Citizen grievance automatically classified to Department of Revenue & Land Administration.",
        requires_human_review: false,
        is_below_threshold: false,
        model_version: "rule-nlp-1.0",
        raw_inference: { rule: "revenue_regex_match" },
      };
    }

    // 6. Women & Child Development
    if (
      /\b(women|child|children|anganwadi|nutrition|ration|poshan|maternity|pregnant|mahila|bal|safety|harassment)\b/i.test(text)
    ) {
      return {
        category: "Women & Child Welfare Support",
        department: "Department of Women & Child Development",
        department_code: "WOMEN_CHILD",
        suggested_department: "WOMEN_CHILD",
        issue_type: "Women & Child Redressal",
        confidence_score: 0.95,
        priority: "HIGH" as any,
        estimated_sla_hours: 24,
        extracted_keywords: ["women", "child", "welfare"],
        sentiment: "NEGATIVE",
        is_urgent: false,
        summary: "Citizen grievance automatically classified to Department of Women & Child Development.",
        requires_human_review: false,
        is_below_threshold: false,
        model_version: "rule-nlp-1.0",
        raw_inference: { rule: "wcd_regex_match" },
      };
    }

    // 7. General Administration (Default Fallback)
    return {
      category: "General Civic Query / Administration",
      department: "General Administration & Citizen Grievance Cell",
      department_code: "GENERAL_ADMINISTRATION",
      suggested_department: "GENERAL_ADMINISTRATION",
      issue_type: "General Civic Complaint",
      confidence_score: 0.90,
      priority: "MEDIUM" as any,
      estimated_sla_hours: 48,
      extracted_keywords: ["general", "administration", "civic"],
      sentiment: "NEUTRAL",
      is_urgent: false,
      summary: "Classified to General Administration & Citizen Grievance Cell for departmental triage.",
      requires_human_review: false,
      is_below_threshold: false,
      model_version: "rule-nlp-1.0",
      raw_inference: { rule: "general_admin_fallback" },
    };
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
