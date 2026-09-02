import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { ApiResponse } from "./utils/apiResponse";

const app = express();

// Security and utility middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// API Routes
app.use("/api/v1", routes);

// 404 Handler
app.use((req, res) => {
  ApiResponse.error(res, `Cannot ${req.method} ${req.url}`, 404);
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
