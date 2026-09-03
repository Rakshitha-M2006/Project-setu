import rateLimit from "express-rate-limit";
import { ApiResponse } from "../utils/apiResponse";

/**
 * 1. Strict Authentication Limiter
 * Blocks brute-force attacks and credential stuffing (10 attempts / 15 minutes)
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 login/register requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many authentication attempts from this IP. Please try again after 15 minutes.",
    },
    timestamp: new Date().toISOString(),
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
});

/**
 * 2. General Public API Rate Limiter
 * Protects server against DDoS and abusive traffic (300 requests / 1 minute)
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // Limit each IP to 300 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "API request limit exceeded. Please throttle your requests.",
    },
    timestamp: new Date().toISOString(),
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
});

/**
 * 3. File Upload Rate Limiter
 * Prevents storage exhaustion attacks (30 uploads / 15 minutes)
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 file upload attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "UPLOAD_LIMIT_EXCEEDED",
      message: "Upload rate limit reached. Please wait before uploading further attachments.",
    },
    timestamp: new Date().toISOString(),
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
});
