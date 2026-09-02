import { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse";
import { HttpStatus } from "../utils/httpStatusCodes";

export const notFoundHandler = (req: Request, res: Response) => {
  return ApiResponse.error(
    res,
    `Route not found: ${req.method} ${req.originalUrl}`,
    HttpStatus.NOT_FOUND
  );
};

export default notFoundHandler;
