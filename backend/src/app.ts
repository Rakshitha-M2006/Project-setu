import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";
import apiRoutes from "./routes";

/**
 * Express Application Factory for PROJECT SETU
 */
export const createApp = (): Application => {
  const app: Application = express();

  // 1. Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: env.isProduction ? undefined : false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // 2. Cross-Origin Resource Sharing (CORS)
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Accept-Language",
        "X-Language",
        "Cache-Control",
        "Pragma",
        "Expires",
      ],
    })
  );

  // 3. Request Body Parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // 4. HTTP Request Logging
  app.use(requestLogger);

  // 5. Root Welcome Route
  app.get("/", (req, res) => {
    res.status(200).json({
      name: "PROJECT SETU Backend API",
      description: "AI-Powered Citizen Grievance & Public Service Management Platform",
      status: "online",
      version: "1.0.0",
      apiBaseUrl: "/api/v1",
      healthCheck: "/api/v1/health",
      timestamp: new Date().toISOString(),
    });
  });

  // 6. Mount API Routes (/api and /api/v1)
  app.use("/api", apiRoutes);

  // 7. Catch-all 404 Route Handler
  app.use(notFoundHandler);

  // 8. Centralized Global Error Handler
  app.use(errorHandler);

  return app;
};

export const app = createApp();
export default app;
