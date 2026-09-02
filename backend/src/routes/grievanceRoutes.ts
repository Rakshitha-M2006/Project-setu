import { Router } from "express";
import {
  submitGrievance,
  getGrievances,
  getGrievanceById,
  updateGrievanceStatus,
  createGrievanceSchema,
  updateStatusSchema,
} from "../controllers/grievanceController";
import { authenticateJwt } from "../middleware/authMiddleware";
import { requireRoles } from "../middleware/roleGuard";
import { validateRequest } from "../middleware/validate";

const router = Router();

router.use(authenticateJwt);

router.post(
  "/",
  requireRoles("CITIZEN", "ADMIN"),
  validateRequest(createGrievanceSchema),
  submitGrievance
);

router.get("/", getGrievances);

router.get("/:id", getGrievanceById);

router.patch(
  "/:id/status",
  requireRoles("OFFICER", "SENIOR_OFFICER", "ADMIN"),
  validateRequest(updateStatusSchema),
  updateGrievanceStatus
);

export default router;
