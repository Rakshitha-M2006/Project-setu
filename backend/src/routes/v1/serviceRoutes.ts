import { Router } from "express";
import { serviceController } from "../../controllers/serviceController";
import { requireAuth, requireRole } from "../../middleware/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

// Public: list available government services
router.get("/", (req, res, next) => serviceController.getServices(req, res, next));

// Private (Citizen): apply for service & view my applications
router.use(requireAuth);

router.post("/:serviceId/apply", requireRole(Role.CITIZEN), (req, res, next) =>
  serviceController.applyForService(req, res, next)
);

router.get("/my/applications", requireRole(Role.CITIZEN), (req, res, next) =>
  serviceController.getMyApplications(req, res, next)
);

export default router;
