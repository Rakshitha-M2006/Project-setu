import { NotificationType } from "@prisma/client";

export interface NotificationPayload {
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string | null;
  metadata?: Record<string, any>;
}

export interface INotificationChannel {
  name: string;
  send(payload: NotificationPayload): Promise<boolean>;
}
