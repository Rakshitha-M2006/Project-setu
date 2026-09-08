import axios, { AxiosError } from "axios";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export interface OllamaGenerateResponse {
  success: boolean;
  response: string;
  model: string;
  durationMs: number;
  error?: string;
  errorType?: "OFFLINE" | "MODEL_NOT_FOUND" | "TIMEOUT" | "EMPTY_RESPONSE" | "API_ERROR";
}

export interface OllamaHealthStatus {
  status: "connected" | "unreachable";
  modelAvailable: boolean;
  model: string;
  installedModels: string[];
  responseTimeMs?: number;
  error?: string;
}

export class OllamaService {
  private static getClient(timeoutMs?: number) {
    return axios.create({
      baseURL: env.OLLAMA_BASE_URL,
      timeout: timeoutMs || env.OLLAMA_TIMEOUT_MS,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Primary method to query Ollama via POST /api/generate
   * @param prompt The complete user prompt / instruction
   * @param systemPrompt Optional system prompt / instructions
   * @param options Optional timeout or model overrides
   */
  static async generate(
    prompt: string,
    systemPrompt?: string,
    options?: { timeoutMs?: number; model?: string; numPredict?: number; temperature?: number }
  ): Promise<OllamaGenerateResponse> {
    const startTime = Date.now();
    const modelToUse = options?.model || env.OLLAMA_MODEL;
    const client = this.getClient(options?.timeoutMs);

    try {
      logger.info(`[Ollama] Dispatching generation request to model '${modelToUse}' at ${env.OLLAMA_BASE_URL}`);

      // Combine system context with user prompt if provided
      const fullPrompt = systemPrompt
        ? `${systemPrompt}\n\nUser Request:\n${prompt}`
        : prompt;

      const payload = {
        model: modelToUse,
        prompt: fullPrompt,
        stream: false,
        options: {
          num_predict: options?.numPredict || 160,
          temperature: options?.temperature !== undefined ? options.temperature : 0.4,
        },
      };

      const res = await client.post("/api/generate", payload);
      const durationMs = Date.now() - startTime;

      if (!res.data || typeof res.data.response !== "string") {
        logger.warn(`[Ollama] Received empty or malformed response from Ollama (${durationMs}ms)`);
        return {
          success: false,
          response: "",
          model: modelToUse,
          durationMs,
          error: "Received empty or malformed response from Ollama.",
          errorType: "EMPTY_RESPONSE",
        };
      }

      const replyText = res.data.response.trim();
      if (!replyText) {
        logger.warn(`[Ollama] Empty AI response string from model '${modelToUse}' (${durationMs}ms)`);
        return {
          success: false,
          response: "",
          model: modelToUse,
          durationMs,
          error: "Ollama returned an empty response string.",
          errorType: "EMPTY_RESPONSE",
        };
      }

      logger.info(`[Ollama] Response generated successfully in ${durationMs}ms (${replyText.length} chars)`);
      return {
        success: true,
        response: replyText,
        model: modelToUse,
        durationMs,
      };
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      const axiosError = err as AxiosError<any>;

      // 1. Connection Refused / Server not running
      if (axiosError.code === "ECONNREFUSED" || axiosError.message?.includes("ECONNREFUSED")) {
        logger.error(`[Ollama] Connection refused at ${env.OLLAMA_BASE_URL}. Ollama is not running.`);
        return {
          success: false,
          response: "",
          model: modelToUse,
          durationMs,
          error: `Ollama is not running. Please ensure Ollama is started locally at ${env.OLLAMA_BASE_URL}.`,
          errorType: "OFFLINE",
        };
      }

      // 2. Request Timeout
      if (axiosError.code === "ECONNABORTED" || axiosError.message?.toLowerCase().includes("timeout")) {
        logger.error(`[Ollama] Request timed out after ${durationMs}ms.`);
        return {
          success: false,
          response: "",
          model: modelToUse,
          durationMs,
          error: `Ollama request timed out after ${durationMs}ms.`,
          errorType: "TIMEOUT",
        };
      }

      // 3. Model Not Found (HTTP 404)
      if (axiosError.response?.status === 404 || axiosError.response?.data?.error?.includes("not found")) {
        logger.error(`[Ollama] Model '${modelToUse}' not found in Ollama repository.`);
        return {
          success: false,
          response: "",
          model: modelToUse,
          durationMs,
          error: `Model '${modelToUse}' is not installed in your local Ollama instance. Run 'ollama run ${modelToUse}' to download it.`,
          errorType: "MODEL_NOT_FOUND",
        };
      }

      // 4. Other API Errors
      const errMsg = axiosError.response?.data?.error || axiosError.message || "Unknown error connecting to Ollama";
      logger.error(`[Ollama] API Error: ${errMsg} (${durationMs}ms)`);
      return {
        success: false,
        response: "",
        model: modelToUse,
        durationMs,
        error: `Ollama error: ${errMsg}`,
        errorType: "API_ERROR",
      };
    }
  }

  /**
   * Health and connectivity check for Ollama instance and model availability
   */
  static async checkHealth(): Promise<OllamaHealthStatus> {
    const startTime = Date.now();
    const client = this.getClient(5000);

    try {
      const res = await client.get<{ models: Array<{ name: string }> }>("/api/tags");
      const duration = Date.now() - startTime;
      const models = Array.isArray(res.data?.models) ? res.data.models.map((m) => m.name) : [];

      // Check if target model or model:latest is available
      const target = env.OLLAMA_MODEL.toLowerCase();
      const modelAvailable = models.some((m) => {
        const lower = m.toLowerCase();
        return lower === target || lower.startsWith(`${target}:`);
      });

      return {
        status: "connected",
        modelAvailable,
        model: env.OLLAMA_MODEL,
        installedModels: models,
        responseTimeMs: duration,
      };
    } catch (err: any) {
      return {
        status: "unreachable",
        modelAvailable: false,
        model: env.OLLAMA_MODEL,
        installedModels: [],
        error: err.message || "Failed to reach Ollama",
      };
    }
  }
}

export default OllamaService;
