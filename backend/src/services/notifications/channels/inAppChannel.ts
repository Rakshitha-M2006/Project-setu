import { INotificationChannel, NotificationPayload } from "../notification.interface";
import { prisma } from "../../../config/database";
import { logger } from "../../../utils/logger";

export class InAppChannel implements INotificationChannel {
  name = "InApp";

  async send(payload: NotificationPayload): Promise<boolean> {
    try {
      await prisma.notification.create({
        data: {
          recipientId: payload.recipientId,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          linkUrl: payload.linkUrl || null,
        },
      });

      logger.info(
        `[Notification:InApp] Dispatched to User ${payload.recipientId}: "${payload.title}"`
      );
      return true;
    } catch (error: any) {
      logger.error(`[Notification:InApp] Error saving notification: ${error.message}`);
      return false;
    }
  }
}

export const inAppChannel = new InAppChannel();
