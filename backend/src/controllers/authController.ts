import { Request, Response, NextFunction } from "express";
import { authService } from "../services/authService";
import { auditService } from "../services/auditService";
import { ApiResponse } from "../utils/apiResponse";
import { RegisterCitizenInput, RegisterOfficerInput, LoginInput } from "../validators/authValidator";
import { AuthenticatedRequest } from "../types";

export class AuthController {
  /**
   * POST /api/v1/auth/register
   * Register a new citizen account
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: RegisterCitizenInput = req.body;
      const result = await authService.registerCitizen(input);

      await auditService.logAction({
        actorId: result.user.id,
        action: "AUTH_REGISTER",
        entityType: "User",
        entityId: result.user.id,
        req,
        metadata: { email: result.user.email, role: result.user.role },
      });

      ApiResponse.created(
        res,
        result,
        "Citizen registered and authenticated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/register-officer
   * Register a new Department Field Officer or Senior Government Officer
   */
  async registerOfficer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: RegisterOfficerInput = req.body;
      const result = await authService.registerOfficer(input);

      await auditService.logAction({
        actorId: result.user.id,
        action: "AUTH_REGISTER_OFFICER",
        entityType: "User",
        entityId: result.user.id,
        req,
        metadata: {
          email: result.user.email,
          role: result.user.role,
          departmentId: (result.user as any).officerProfile?.departmentId,
        },
      });

      const roleLabel = result.user.role === "SENIOR_OFFICER" ? "Senior Government Officer" : "Department Field Officer";
      ApiResponse.created(
        res,
        result,
        `${roleLabel} registered and authenticated successfully`
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/login
   * Authenticate user credentials and return access token
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: LoginInput = req.body;
      const result = await authService.login(input);

      await auditService.logAction({
        actorId: result.user.id,
        action: "AUTH_LOGIN",
        entityType: "User",
        entityId: result.user.id,
        req,
        metadata: { email: result.user.email, role: result.user.role },
      });

      ApiResponse.success(
        res,
        result,
        "Signed in successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   * Retrieve current authenticated user profile
   */
  async getCurrentUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const userProfile = await authService.getCurrentUser(userId);

      ApiResponse.success(
        res,
        userProfile,
        "User profile retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Stateless token logout acknowledgement
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = (req as any).user?.id || null;

      await auditService.logAction({
        actorId,
        action: "AUTH_LOGOUT",
        entityType: "User",
        entityId: actorId,
        req,
      });

      ApiResponse.success(
        res,
        null,
        "Successfully signed out. Client session token should now be cleared."
      );
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
export default authController;
