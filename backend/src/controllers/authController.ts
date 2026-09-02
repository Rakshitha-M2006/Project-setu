import { Request, Response, NextFunction } from "express";
import { authService } from "../services/authService";
import { ApiResponse } from "../utils/apiResponse";
import { RegisterCitizenInput, LoginInput } from "../validators/authValidator";
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
   * POST /api/v1/auth/login
   * Authenticate user credentials and return access token
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: LoginInput = req.body;
      const result = await authService.login(input);

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
