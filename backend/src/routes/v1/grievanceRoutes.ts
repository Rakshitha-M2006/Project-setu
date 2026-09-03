import { Router } from "express";
import {
  submitGrievance,
  getGrievances,
  getGrievanceById,
  updateGrievanceStatus,
  createGrievanceSchema,
  updateStatusSchema,
} from "../../controllers/grievanceController";
import { validateRequest } from "../../middleware/validate";
import { requireAuth, requireAnyRole } from "../../middleware/authMiddleware";
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
  validateRequest(createGrievanceSchema),
  (req, res, next) => submitGrievance(req, res, next)
);

/**
 * @route   GET /api/v1/grievances
 * @desc    List grievances (filtered by user role)
 * @access  Private
 */
router.get("/", (req, res, next) => getGrievances(req, res, next));

/**
 * @route   GET /api/v1/grievances/:id
 * @desc    Get detailed grievance by ID
 * @access  Private
 */
router.get("/:id", (req, res, next) => getGrievanceById(req, res, next));

/**
 * @route   PATCH /api/v1/grievances/:id/status
 * @desc    Update grievance status
 * @access  Private (Officers & Admins)
 */
router.patch(
  "/:id/status",
  requireAnyRole(Role.OFFICER, Role.SENIOR_OFFICER, Role.ADMIN),
  validateRequest(updateStatusSchema),
  (req, res, next) => updateGrievanceStatus(req, res, next)
);

export default router;
