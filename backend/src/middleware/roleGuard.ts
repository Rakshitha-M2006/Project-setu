import { Request, Response, NextFunction } from "express";
import { UserRole } from "../types";
import { ApiError } from "../utils/apiError";

export const requireRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized("Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Forbidden: Insufficient privileges. Required one of: [${allowedRoles.join(", ")}]`
        )
      );
    }

    next();
  };
};
