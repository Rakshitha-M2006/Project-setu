import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5000),
  HOST: z.string().default("0.0.0.0"),
  API_PREFIX: z.string().default("/api/v1"),
  DATABASE_URL: z.string().default("mysql://root:password@localhost:3306/project_setu_db"),
  JWT_SECRET: z.string().default("setu_jwt_super_secret_development_key_change_in_production"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  AI_SERVICE_URL: z.string().default("http://localhost:8000"),
  AI_CONFIDENCE_THRESHOLD: z.coerce.number().default(0.85),
  AI_REQUEST_TIMEOUT_MS: z.coerce.number().default(5000),
  CORS_ORIGIN: z.string().default("http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.format());
    throw new Error("Invalid environment configuration. Please check your .env file.");
  }

  return {
    ...result.data,
    corsOrigins: result.data.CORS_ORIGIN.split(",").map((o) => o.trim()),
    isProduction: result.data.NODE_ENV === "production",
    isDevelopment: result.data.NODE_ENV === "development",
    isTest: result.data.NODE_ENV === "test",
  };
};

export const env = parseEnv();
export type EnvConfig = typeof env;
export default env;
