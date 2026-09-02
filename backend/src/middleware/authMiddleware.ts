import { Request, Response, NextFunction } from "express";
import { authService } from "../services/authService";
import { ApiError } from "../utils/apiError";
import { Role } from "@prisma/client";
import { AuthenticatedRequest } from "../types";

/**
 * Authentication Middleware:
 * Verifies the JWT Bearer token in the Authorization header
 * and populates `req.user` with the validated user session payload.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(ApiError.unauthorized("Authentication required. Please provide a Bearer token."));
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return next(ApiError.unauthorized("Authorization header must follow format: Bearer <token>"));
  }

  const token = parts[1];

  try {
    const payload = authService.verifyToken(token);
    (req as AuthenticatedRequest).user = payload;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role Authorization Middleware:
 * Restricts access to a single specific role.
 */
export const requireRole = (role: Role) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      return next(ApiError.unauthorized("Authentication required"));
    }

    if (user.role !== role) {
      return next(
        ApiError.forbidden(
          `Forbidden: This action requires the '${role}' role. Current role: '${user.role}'`
        )
      );
    }

    next();
  };
};

/**
 * Role Authorization Middleware:
 * Restricts access to any of the specified roles in the whitelist.
 */
export const requireAnyRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      return next(ApiError.unauthorized("Authentication required"));
    }

    if (!allowedRoles.includes(user.role)) {
      return next(
        ApiError.forbidden(
          `Forbidden: Insufficient privileges. Required one of: [${allowedRoles.join(", ")}]. Current role: '${user.role}'`
        )
      );
    }

    next();
  };
};

/**
 * Alias for requireAnyRole
 */
export const requireRoles = requireAnyRole;

/**
 * Optional Authentication Middleware:
 * Attaches user session if a valid token is provided, but continues without error if absent.
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      (req as AuthenticatedRequest).user = authService.verifyToken(token);
    } catch {
      // Ignore errors for optional auth
    }
  }

  next();
};

export default {
  requireAuth,
  requireRole,
  requireAnyRole,
  requireRoles,
  optionalAuth,
};
