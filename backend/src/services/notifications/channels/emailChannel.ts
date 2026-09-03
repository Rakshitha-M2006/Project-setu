import { INotificationChannel, NotificationPayload } from "../notification.interface";
import { prisma } from "../../../config/database";
import { logger } from "../../../utils/logger";

export class EmailChannel implements INotificationChannel {
  name = "Email";

  async send(payload: NotificationPayload): Promise<boolean> {
    try {
      // In development, log the transactional email dispatch
      // Extensible for SMTP / AWS SES / SendGrid credentials
      const user = await prisma.user.findUnique({
        where: { id: payload.recipientId },
        select: { email: true, fullName: true },
      });

      if (user?.email) {
        logger.info(
          `[Notification:Email] [DISPATCH] To: ${user.fullName} <${user.email}> | Subject: "${payload.title}"`
        );
      }
      return true;
    } catch (error: any) {
      logger.error(`[Notification:Email] Error dispatching email: ${error.message}`);
      return false;
    }
  }
}

export const emailChannel = new EmailChannel();
