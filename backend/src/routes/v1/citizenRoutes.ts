import { Router } from "express";
import { citizenController } from "../../controllers/citizenController";
import { requireAuth, requireRole } from "../../middleware/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

// Require Citizen role for citizen portal routes
router.use(requireAuth);
router.use(requireRole(Role.CITIZEN));

/**
 * @route   GET /api/v1/citizen/dashboard-stats
 * @desc    Get real-time dashboard metrics, recent grievances, and notifications
 * @access  Private (Citizen)
 */
router.get("/dashboard-stats", (req, res, next) =>
  citizenController.getDashboardStats(req, res, next)
);

/**
 * @route   GET /api/v1/citizen/profile
 * @desc    Get complete citizen profile
 * @access  Private (Citizen)
 */
router.get("/profile", (req, res, next) =>
  citizenController.getProfile(req, res, next)
);

/**
 * @route   PUT /api/v1/citizen/profile
 * @desc    Update citizen profile details
 * @access  Private (Citizen)
 */
router.put("/profile", (req, res, next) =>
  citizenController.updateProfile(req, res, next)
);

export default router;
