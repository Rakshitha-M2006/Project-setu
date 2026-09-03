import { Router } from "express";
import { anomalyController } from "../../controllers/anomalyController";
import { requireAuth, requireAnyRole } from "../../middleware/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

router.use(requireAuth);
router.use(requireAnyRole(Role.ADMIN, Role.SENIOR_OFFICER));

router.get("/", (req, res, next) => anomalyController.getAnomalies(req, res, next));
router.post("/scan", (req, res, next) => anomalyController.triggerScan(req, res, next));
router.patch("/:id/status", (req, res, next) => anomalyController.updateStatus(req, res, next));

export default router;
