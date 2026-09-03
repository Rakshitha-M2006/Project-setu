import { Router } from "express";
import { notificationController } from "../../controllers/notificationController";
import { requireAuth } from "../../middleware/authMiddleware";

const router = Router();

router.use(requireAuth);

/**
 * @route   GET /api/v1/notifications
 * @desc    Get current user notifications
 * @access  Private
 */
router.get("/", (req, res, next) => notificationController.getMyNotifications(req, res, next));

/**
 * @route   PATCH /api/v1/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
router.patch("/:id/read", (req, res, next) => notificationController.markAsRead(req, res, next));

/**
 * @route   POST /api/v1/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.post("/mark-all-read", (req, res, next) =>
  notificationController.markAllAsRead(req, res, next)
);

export default router;
