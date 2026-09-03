import { Router } from "express";
import { analyticsController } from "../../controllers/analyticsController";
import { requireAuth } from "../../middleware/authMiddleware";

const router = Router();

router.use(requireAuth);

router.get("/overview", (req, res, next) => analyticsController.getOverviewAnalytics(req, res, next));

export default router;
