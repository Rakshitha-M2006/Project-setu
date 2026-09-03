import { Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { ApiResponse } from "../utils/apiResponse";
import { AuthenticatedRequest } from "../types";

export class NotificationController {
  /**
   * GET /api/v1/notifications
   * Get all notifications for current authenticated user with unread count
   */
  async getMyNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { filter, limit } = req.query;

      const take = Number(limit) || 50;
      const whereClause: any = { recipientId: userId };

      if (filter === "UNREAD") {
        whereClause.isRead = false;
      }

      const [notifications, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          take,
        }),
        prisma.notification.count({
          where: { recipientId: userId, isRead: false },
        }),
      ]);

      ApiResponse.success(
        res,
        {
          notifications,
          unreadCount,
          totalCount: notifications.length,
        },
        "Notifications retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/notifications/unread-count
   * Quick counter for header bell badge
   */
  async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      const unreadCount = await prisma.notification.count({
        where: { recipientId: userId, isRead: false },
      });

      ApiResponse.success(res, { unreadCount }, "Unread notification count retrieved");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/notifications/:id/read
   * Mark a single notification as read
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
   * Mark all notifications as read for current user
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

  /**
   * DELETE /api/v1/notifications/:id
   * Dismiss/delete a notification
   */
  async deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      await prisma.notification.deleteMany({
        where: { id, recipientId: userId },
      });

      ApiResponse.success(res, { id }, "Notification dismissed");
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
export default notificationController;
