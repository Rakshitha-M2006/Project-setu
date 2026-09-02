import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { HttpStatus } from "../utils/httpStatusCodes";
import { logger } from "../utils/logger";
import { env } from "../config/env";

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    if (err.statusCode >= 500) {
      logger.error(`[${req.method}] ${req.originalUrl} - Server Error: ${err.message}`, err.stack);
    } else {
      logger.warn(`[${req.method}] ${req.originalUrl} - Client Error (${err.statusCode}): ${err.message}`);
    }

    return ApiResponse.error(res, err.message, err.statusCode, err.errors);
  }

  // Handle Prisma Known Request Errors
  if ("code" in err && typeof (err as any).code === "string") {
    const prismaError = err as any;
    logger.warn(`[Prisma Error ${prismaError.code}] on ${req.method} ${req.originalUrl}: ${prismaError.message}`);

    if (prismaError.code === "P2002") {
      const target = prismaError.meta?.target || "Field";
      return ApiResponse.error(res, `A record with this ${target} already exists.`, HttpStatus.CONFLICT);
    }

    if (prismaError.code === "P2025") {
      return ApiResponse.error(res, "The requested resource was not found.", HttpStatus.NOT_FOUND);
    }
  }

  // Handle unexpected non-operational errors
  logger.error(`[Unhandled Exception] on ${req.method} ${req.originalUrl}:`, err);

  const message = env.isProduction ? "An unexpected server error occurred" : err.message;
  return ApiResponse.error(res, message, HttpStatus.INTERNAL_SERVER_ERROR);
};

export default errorHandler;
