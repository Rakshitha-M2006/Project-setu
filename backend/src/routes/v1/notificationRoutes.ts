import { Router } from "express";
import { notificationController } from "../../controllers/notificationController";
import { requireAuth } from "../../middleware/authMiddleware";

const router = Router();

router.use(requireAuth);

router.get("/", (req, res, next) => notificationController.getMyNotifications(req, res, next));
router.get("/unread-count", (req, res, next) => notificationController.getUnreadCount(req, res, next));
router.patch("/:id/read", (req, res, next) => notificationController.markAsRead(req, res, next));
router.post("/mark-all-read", (req, res, next) => notificationController.markAllAsRead(req, res, next));
router.patch("/read-all", (req, res, next) => notificationController.markAllAsRead(req, res, next));
router.delete("/:id", (req, res, next) => notificationController.deleteNotification(req, res, next));

export default router;
