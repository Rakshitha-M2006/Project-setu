import { Router } from "express";
import { authController } from "../../controllers/authController";
import { validateRequest } from "../../middleware/validate";
import { requireAuth } from "../../middleware/authMiddleware";
import {
  registerCitizenSchema,
  loginSchema,
} from "../../validators/authValidator";

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new citizen account
 * @access  Public
 */
router.post(
  "/register",
  validateRequest(registerCitizenSchema),
  (req, res, next) => authController.register(req, res, next)
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user credentials and issue JWT
 * @access  Public
 */
router.post(
  "/login",
  validateRequest(loginSchema),
  (req, res, next) => authController.login(req, res, next)
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get currently logged in user profile
 * @access  Private (Authenticated)
 */
router.get(
  "/me",
  requireAuth,
  (req, res, next) => authController.getCurrentUser(req, res, next)
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Sign out and acknowledge session termination
 * @access  Private (Authenticated)
 */
router.post(
  "/logout",
  requireAuth,
  (req, res, next) => authController.logout(req, res, next)
);

export default router;
