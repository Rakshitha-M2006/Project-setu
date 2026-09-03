import { INotificationChannel, NotificationPayload } from "../notification.interface";
import { prisma } from "../../../config/database";
import { logger } from "../../../utils/logger";

export class SmsChannel implements INotificationChannel {
  name = "SMS";

  async send(payload: NotificationPayload): Promise<boolean> {
    try {
      // Extensible for CDAC / NIC / Twilio SMS gateway integration
      const user = await prisma.user.findUnique({
        where: { id: payload.recipientId },
        select: { phone: true, fullName: true },
      });

      if (user?.phone) {
        logger.info(
          `[Notification:SMS] [DISPATCH] To: ${user.phone} | Body: "[PROJECT SETU] ${payload.title}: ${payload.message.slice(0, 100)}..."`
        );
      }
      return true;
    } catch (error: any) {
      logger.error(`[Notification:SMS] Error dispatching SMS: ${error.message}`);
      return false;
    }
  }
}

export const smsChannel = new SmsChannel();
