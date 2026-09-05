import { Router } from "express";
import { assistantController } from "../../controllers/assistantController";
import { optionalAuth } from "../../middleware/authMiddleware";

const router = Router();

// Allow both guests and authenticated citizens to query assistant
router.post("/chat", optionalAuth, (req, res, next) => assistantController.chat(req as any, res, next));
router.get("/quick-actions", (req, res, next) => assistantController.getQuickActions(req, res, next));

export default router;
