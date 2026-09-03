import { NotificationType, GrievanceStatus, ApplicationStatus, EscalationLevel } from "@prisma/client";
import { INotificationChannel, NotificationPayload } from "./notification.interface";
import { inAppChannel } from "./channels/inAppChannel";
import { emailChannel } from "./channels/emailChannel";
import { smsChannel } from "./channels/smsChannel";
import { logger } from "../../utils/logger";

export class NotificationService {
  private channels: INotificationChannel[] = [inAppChannel, emailChannel, smsChannel];

  /**
   * Broadcast a notification payload across all active channels
   */
  async send(payload: NotificationPayload): Promise<void> {
    for (const channel of this.channels) {
      try {
        await channel.send(payload);
      } catch (err: any) {
        logger.error(`[NotificationService] Channel '${channel.name}' failed: ${err.message}`);
      }
    }
  }

  // ============================================================================
  // 10 Event-Driven Lifecycle Trigger Handlers
  // ============================================================================

  /**
   * 1. Grievance Submitted
   */
  async onGrievanceSubmitted(grievance: { id: string; trackingNumber: string; citizenId: string; title: string }): Promise<void> {
    await this.send({
      recipientId: grievance.citizenId,
      type: NotificationType.GRIEVANCE_STATUS_UPDATE,
      title: `Grievance Registered: ${grievance.trackingNumber}`,
      message: `Your grievance "${grievance.title}" has been registered in the municipal registry under reference number ${grievance.trackingNumber}. NLP AI triage is currently routing your complaint.`,
      linkUrl: `/citizen/grievances/${grievance.id}`,
    });
  }

  /**
   * 2. AI Classification Completed
   */
  async onAiClassificationCompleted(
    grievance: { id: string; trackingNumber: string; citizenId: string },
    classification: { departmentName: string; categoryName: string; priority: string; confidence: number; suggestedSlaHours: number }
  ): Promise<void> {
    await this.send({
      recipientId: grievance.citizenId,
      type: NotificationType.GRIEVANCE_STATUS_UPDATE,
      title: `AI Triage Complete: ${grievance.trackingNumber}`,
      message: `Your grievance has been classified into "${classification.categoryName}" under the ${classification.departmentName} with ${classification.priority} priority (SLA: ${classification.suggestedSlaHours}h turnaround).`,
      linkUrl: `/citizen/grievances/${grievance.id}`,
    });
  }

  /**
   * 3. Department Assigned
   */
  async onDepartmentAssigned(
    grievance: { id: string; trackingNumber: string; citizenId: string },
    departmentName: string
  ): Promise<void> {
    await this.send({
      recipientId: grievance.citizenId,
      type: NotificationType.GRIEVANCE_STATUS_UPDATE,
      title: `Department Assigned: ${grievance.trackingNumber}`,
      message: `Your complaint ${grievance.trackingNumber} has been officially allocated to the ${departmentName} for field investigation and resolution.`,
      linkUrl: `/citizen/grievances/${grievance.id}`,
    });
  }

  /**
   * 4. Officer Assigned
   */
  async onOfficerAssigned(
    grievance: { id: string; trackingNumber: string; citizenId: string; title: string },
    officer: { userId: string; fullName: string; designation: string }
  ): Promise<void> {
    // Notify Citizen
    await this.send({
      recipientId: grievance.citizenId,
      type: NotificationType.OFFICER_ASSIGNED,
      title: `Field Officer Assigned: ${grievance.trackingNumber}`,
      message: `Field Officer ${officer.fullName} (${officer.designation}) has claimed your grievance and initiated on-site technical inspection.`,
      linkUrl: `/citizen/grievances/${grievance.id}`,
    });

    // Notify Officer
    await this.send({
      recipientId: officer.userId,
      type: NotificationType.OFFICER_ASSIGNED,
      title: `New Case Assigned: ${grievance.trackingNumber}`,
      message: `You have been assigned grievance ${grievance.trackingNumber}: "${grievance.title}". Please initiate inspection within stipulated SLA window.`,
      linkUrl: `/officer/grievances/${grievance.id}`,
    });
  }

  /**
   * 5. Grievance Status Changed
   */
  async onGrievanceStatusChanged(
    grievance: { id: string; trackingNumber: string; citizenId: string },
    oldStatus: GrievanceStatus,
    newStatus: GrievanceStatus,
    remarks?: string | null
  ): Promise<void> {
    const formattedStatus = newStatus.replace(/_/g, " ");
    await this.send({
      recipientId: grievance.citizenId,
      type: NotificationType.GRIEVANCE_STATUS_UPDATE,
      title: `Status Updated: ${grievance.trackingNumber} (${formattedStatus})`,
      message: `The status of your grievance ${grievance.trackingNumber} has moved from ${oldStatus.replace(/_/g, " ")} to ${formattedStatus}.${remarks ? ` Note: "${remarks}"` : ""}`,
      linkUrl: `/citizen/grievances/${grievance.id}`,
    });
  }

  /**
   * 6. Grievance Resolved
   */
  async onGrievanceResolved(
    grievance: { id: string; trackingNumber: string; citizenId: string },
    resolutionSummary: string
  ): Promise<void> {
    await this.send({
      recipientId: grievance.citizenId,
      type: NotificationType.GRIEVANCE_STATUS_UPDATE,
      title: `Grievance Resolved: ${grievance.trackingNumber}`,
      message: `Your grievance ${grievance.trackingNumber} has been resolved by the department. Resolution Summary: "${resolutionSummary}". Please provide your rating and feedback.`,
      linkUrl: `/citizen/grievances/${grievance.id}`,
    });
  }

  /**
   * 7. SLA Approaching
   */
  async onSlaApproaching(
    grievance: { id: string; trackingNumber: string },
    officerUserId: string,
    hoursRemaining: number
  ): Promise<void> {
    await this.send({
      recipientId: officerUserId,
      type: NotificationType.SLA_BREACH_WARNING,
      title: `⚠️ SLA Warning: ${grievance.trackingNumber}`,
      message: `Grievance ${grievance.trackingNumber} has only ${hoursRemaining} hours remaining before statutory SLA breach. Expedite investigation immediately.`,
      linkUrl: `/officer/grievances/${grievance.id}`,
    });
  }

  /**
   * 8. SLA Breached & Escalated
   */
  async onSlaBreached(
    grievance: { id: string; trackingNumber: string; citizenId: string },
    escalationLevel: EscalationLevel,
    supervisorUserId?: string | null
  ): Promise<void> {
    // Notify Citizen with reassurance
    await this.send({
      recipientId: grievance.citizenId,
      type: NotificationType.ESCALATION_TRIGGERED,
      title: `Case Escalated: ${grievance.trackingNumber}`,
      message: `Your grievance ${grievance.trackingNumber} has exceeded the standard turnaround window and has been automatically escalated to a Senior Departmental Officer for expedited priority handling.`,
      linkUrl: `/citizen/grievances/${grievance.id}`,
    });

    // Notify Supervisor
    if (supervisorUserId) {
      await this.send({
        recipientId: supervisorUserId,
        type: NotificationType.ESCALATION_TRIGGERED,
        title: `🚨 Escalation Level ${escalationLevel}: ${grievance.trackingNumber}`,
        message: `Grievance ${grievance.trackingNumber} has breached SLA timeline and is escalated to your command queue for supervisory intervention.`,
        linkUrl: `/officer/grievances/${grievance.id}`,
      });
    }
  }

  /**
   * 9. Service Application Submitted
   */
  async onServiceApplicationSubmitted(
    application: { id: string; applicationNumber: string; citizenId: string },
    serviceName: string,
    estimatedDays: number
  ): Promise<void> {
    await this.send({
      recipientId: application.citizenId,
      type: NotificationType.SERVICE_APPLICATION_UPDATE,
      title: `Application Submitted: ${application.applicationNumber}`,
      message: `Your application for "${serviceName}" has been received under reference ${application.applicationNumber}. Estimated turnaround: ${estimatedDays} working days.`,
      linkUrl: `/citizen/applications/${application.id}`,
    });
  }

  /**
   * 10. Service Application Status Changed
   */
  async onServiceApplicationStatusChanged(
    application: { id: string; applicationNumber: string; citizenId: string },
    serviceName: string,
    newStatus: ApplicationStatus,
    remarks?: string | null
  ): Promise<void> {
    const formattedStatus = newStatus.replace(/_/g, " ");
    await this.send({
      recipientId: application.citizenId,
      type: NotificationType.SERVICE_APPLICATION_UPDATE,
      title: `Application Update: ${application.applicationNumber} (${formattedStatus})`,
      message: `Your application for "${serviceName}" is now ${formattedStatus}.${remarks ? ` Remarks: "${remarks}"` : ""}`,
      linkUrl: `/citizen/applications/${application.id}`,
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;
