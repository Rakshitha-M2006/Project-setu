import { Router } from "express";
import { healthController } from "../../controllers/healthController";

const router = Router();

/**
 * @route   GET /api/v1/health
 * @desc    Comprehensive system health and dependencies status
 * @access  Public
 */
router.get("/health", (req, res, next) => healthController.getHealth(req, res, next));

export default router;
