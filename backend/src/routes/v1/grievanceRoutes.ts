import { Router } from "express";
import {
  grievanceController,
  createGrievanceSchema,
  updateStatusSchema,
} from "../../controllers/grievanceController";
import { validateRequest } from "../../middleware/validate";
import { requireAuth, requireRole, requireAnyRole } from "../../middleware/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

router.use(requireAuth);

/**
 * @route   POST /api/v1/grievances
 * @desc    Submit new citizen grievance
 * @access  Private (Citizen)
 */
router.post(
  "/",
  requireRole(Role.CITIZEN),
  validateRequest(createGrievanceSchema),
  (req, res, next) => grievanceController.submitGrievance(req as any, res, next)
);

/**
 * @route   GET /api/v1/grievances/my
 * @desc    List all grievances submitted by current citizen
 * @access  Private (Citizen)
 */
router.get("/my", requireRole(Role.CITIZEN), (req, res, next) =>
  grievanceController.getMyGrievances(req as any, res, next)
);

/**
 * @route   GET /api/v1/grievances/:id
 * @desc    Get detailed grievance by ID or trackingNumber
 * @access  Private (Owner Citizen or Authorized Officer/Admin)
 */
router.get("/:id", (req, res, next) =>
  grievanceController.getGrievanceById(req as any, res, next)
);

/**
 * @route   GET /api/v1/grievances
 * @desc    List grievances (filtered by role / query parameters)
 * @access  Private
 */
router.get("/", (req, res, next) =>
  grievanceController.getGrievances(req as any, res, next)
);

/**
 * @route   PATCH /api/v1/grievances/:id/status
 * @desc    Update grievance status
 * @access  Private (Officers & Admins)
 */
router.patch(
  "/:id/status",
  requireAnyRole(Role.OFFICER, Role.SENIOR_OFFICER, Role.ADMIN),
  validateRequest(updateStatusSchema),
  (req, res, next) => grievanceController.updateGrievanceStatus(req as any, res, next)
);

export default router;
