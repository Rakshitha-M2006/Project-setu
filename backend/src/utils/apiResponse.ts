import { Response } from "express";

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message: string = "Operation successful",
    statusCode: number = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  static created<T>(res: Response, data: T, message: string = "Resource created successfully") {
    return this.success(res, data, message, 201);
  }

  static error(
    res: Response,
    message: string = "An error occurred",
    statusCode: number = 500,
    errors: any = null
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }
}
