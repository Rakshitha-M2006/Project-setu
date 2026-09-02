import { HttpStatus, HttpStatusCode } from "./httpStatusCodes";

export class ApiError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly isOperational: boolean;
  public readonly errors: any;

  constructor(
    message: string,
    statusCode: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    errors: any = null,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string = "Bad Request", errors: any = null) {
    return new ApiError(message, HttpStatus.BAD_REQUEST, errors);
  }

  static unauthorized(message: string = "Authentication required") {
    return new ApiError(message, HttpStatus.UNAUTHORIZED);
  }

  static forbidden(message: string = "Access forbidden: insufficient permissions") {
    return new ApiError(message, HttpStatus.FORBIDDEN);
  }

  static notFound(message: string = "Requested resource not found") {
    return new ApiError(message, HttpStatus.NOT_FOUND);
  }

  static conflict(message: string = "Resource conflict detected") {
    return new ApiError(message, HttpStatus.CONFLICT);
  }

  static unprocessableEntity(message: string = "Validation failed", errors: any = null) {
    return new ApiError(message, HttpStatus.UNPROCESSABLE_ENTITY, errors);
  }

  static tooManyRequests(message: string = "Rate limit exceeded. Please try again later.") {
    return new ApiError(message, HttpStatus.TOO_MANY_REQUESTS);
  }

  static internal(message: string = "Internal server error") {
    return new ApiError(message, HttpStatus.INTERNAL_SERVER_ERROR, null, false);
  }

  static serviceUnavailable(message: string = "Service temporarily unavailable") {
    return new ApiError(message, HttpStatus.SERVICE_UNAVAILABLE, null, false);
  }
}

export default ApiError;
