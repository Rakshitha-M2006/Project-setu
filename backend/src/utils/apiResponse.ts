import { Response } from "express";
import { HttpStatus, HttpStatusCode } from "./httpStatusCodes";

export interface ApiResponseOptions<T> {
  res: Response;
  data?: T;
  message?: string;
  statusCode?: HttpStatusCode;
  errors?: any;
}

export class ApiResponse {
  /**
   * Send a standardized success JSON response
   */
  static success<T>(
    res: Response,
    data: T,
    message: string = "Operation completed successfully",
    statusCode: HttpStatusCode = HttpStatus.OK
  ) {
    return res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send a 201 Created response
   */
  static created<T>(
    res: Response,
    data: T,
    message: string = "Resource created successfully"
  ) {
    return this.success(res, data, message, HttpStatus.CREATED);
  }

  /**
   * Send a 204 No Content response
   */
  static noContent(res: Response) {
    return res.status(HttpStatus.NO_CONTENT).send();
  }

  /**
   * Send a standardized error JSON response
   */
  static error(
    res: Response,
    message: string = "An error occurred",
    statusCode: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    errors: any = null
  ) {
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errors: errors || undefined,
      timestamp: new Date().toISOString(),
    });
  }
}

export default ApiResponse;
