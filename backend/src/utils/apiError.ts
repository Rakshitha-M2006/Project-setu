export class ApiError extends Error {
  public statusCode: number;
  public errors: any;

  constructor(message: string, statusCode: number = 500, errors: any = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors: any = null) {
    return new ApiError(message, 400, errors);
  }

  static unauthorized(message: string = "Unauthorized access") {
    return new ApiError(message, 401);
  }

  static forbidden(message: string = "Access forbidden") {
    return new ApiError(message, 403);
  }

  static notFound(message: string = "Resource not found") {
    return new ApiError(message, 404);
  }

  static conflict(message: string = "Resource conflict") {
    return new ApiError(message, 409);
  }

  static internal(message: string = "Internal server error") {
    return new ApiError(message, 500);
  }
}
