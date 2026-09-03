import { Router } from "express";
import { serviceController, submitServiceApplicationSchema, updateApplicationStatusSchema } from "../../controllers/serviceController";
import { requireAuth, requireRole, requireAnyRole } from "../../middleware/authMiddleware";
import validateRequest from "../../middleware/validate";
import { Role } from "@prisma/client";

const router = Router();

// 1. Public Government Services Catalog
router.get("/", (req, res, next) => serviceController.getServices(req, res, next));
router.get("/:id", (req, res, next) => serviceController.getServiceById(req, res, next));

// 2. Private Citizen Application Management
router.use(requireAuth);

router.post(
  "/:serviceId/apply",
  requireRole(Role.CITIZEN),
  validateRequest(submitServiceApplicationSchema),
  (req, res, next) => serviceController.applyForService(req, res, next)
);

router.get("/my/applications", requireRole(Role.CITIZEN), (req, res, next) =>
  serviceController.getMyApplications(req, res, next)
);

router.get("/applications/:id", (req, res, next) =>
  serviceController.getApplicationById(req, res, next)
);

// 3. Officer Review & Workflow Transition
router.patch(
  "/applications/:id/status",
  requireAnyRole(Role.OFFICER, Role.SENIOR_OFFICER, Role.ADMIN),
  validateRequest(updateApplicationStatusSchema),
  (req, res, next) => serviceController.updateApplicationStatus(req, res, next)
);

export default router;
