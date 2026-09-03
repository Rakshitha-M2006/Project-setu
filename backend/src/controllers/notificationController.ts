import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { ApiResponse } from "../utils/apiResponse";
import { AuthenticatedRequest } from "../types";

export class NotificationController {
  /**
   * GET /api/v1/notifications
   * Get all notifications for current authenticated user
   */
  async getMyNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      const notifications = await prisma.notification.findMany({
        where: { recipientId: userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      ApiResponse.success(res, notifications, "Notifications retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/notifications/:id/read
   * Mark a notification as read
   */
  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const updated = await prisma.notification.updateMany({
        where: { id, recipientId: userId },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      ApiResponse.success(res, { count: updated.count }, "Notification marked as read");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/notifications/mark-all-read
   * Mark all notifications as read
   */
  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      const updated = await prisma.notification.updateMany({
        where: { recipientId: userId, isRead: false },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      ApiResponse.success(res, { updatedCount: updated.count }, "All notifications marked as read");
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
export default notificationController;
