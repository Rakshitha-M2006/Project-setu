import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { logger } from "../utils/logger";
import { ZodError } from "zod";

export const errorHandler = (
  err: Error | ApiError | ZodError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    logger.warn(`API Error [${err.statusCode}]: ${err.message}`);
    return ApiResponse.error(res, err.message, err.statusCode, err.errors);
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    logger.warn(`Validation Error on ${req.method} ${req.url}:`, formattedErrors);
    return ApiResponse.error(res, "Validation failed", 400, formattedErrors);
  }

  logger.error(`Unhandled Exception on ${req.method} ${req.url}:`, err);
  return ApiResponse.error(
    res,
    process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
    500
  );
};
