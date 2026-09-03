import { prisma } from "../config/database";
import { logger } from "../utils/logger";
import { SLA_CONFIG, ESCALATION_TIERS } from "../config/slaConfig";
import { Priority, GrievanceStatus, EscalationLevel, EscalationStatus, NotificationType } from "@prisma/client";

export interface SlaStatusDetail {
  totalHours: number;
  elapsedHours: number;
  remainingHours: number;
  progressPercentage: number;
  isBreached: boolean;
  isWarning: boolean;
  slaState: "ON_TRACK" | "WARNING" | "BREACHED" | "RESOLVED_ON_TIME" | "RESOLVED_OVERDUE";
  slaDeadline: Date | null;
  currentEscalationLevel: EscalationLevel | null;
  citizenFriendlyStatus: string;
}

export class SlaService {
  /**
   * 1. calculateDeadline()
   * Database-driven SLA turnaround calculation with fallback to SLA_CONFIG
   */
  static async calculateDeadline(
    priority: Priority,
    departmentId?: string | null,
    categoryId?: string | null
  ): Promise<{ slaHours: number; deadline: Date }> {
    let slaHours = SLA_CONFIG[priority]?.hours || 48;

    try {
      // 1. Check if Category has specific SLA override
      if (categoryId) {
        const cat = await prisma.grievanceCategory.findUnique({
          where: { id: categoryId },
        });
        if (cat && cat.defaultSlaHours > 0) {
          slaHours = cat.defaultSlaHours;
        }
      } else if (departmentId) {
        // 2. Check if Department has default SLA
        const dept = await prisma.department.findUnique({
          where: { id: departmentId },
        });
        if (dept && dept.defaultSlaHours > 0) {
          slaHours = dept.defaultSlaHours;
        }
      }
    } catch (err: any) {
      logger.warn(`[SLA] Database SLA lookup skipped: ${err.message}. Using default priority SLA.`);
    }

    const deadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    return { slaHours, deadline };
  }

  /**
   * 2. getGrievanceSlaStatus()
   * Computes real-time SLA metrics, remaining time, warning flags, and citizen-friendly status
   */
  static getGrievanceSlaStatus(grievance: {
    createdAt: Date;
    slaDeadline: Date | null;
    status: GrievanceStatus;
    resolvedAt?: Date | null;
    priority: Priority;
    escalations?: Array<{ escalationLevel: EscalationLevel; status: EscalationStatus }>;
  }): SlaStatusDetail {
    const now = new Date();
    const created = new Date(grievance.createdAt);
    const deadline = grievance.slaDeadline ? new Date(grievance.slaDeadline) : new Date(created.getTime() + 48 * 3600 * 1000);
    const resolvedAt = grievance.resolvedAt ? new Date(grievance.resolvedAt) : null;

    const totalDurationMs = Math.max(1000, deadline.getTime() - created.getTime());
    const totalHours = Math.round((totalDurationMs / (1000 * 60 * 60)) * 10) / 10;

    const effectiveEnd = resolvedAt || now;
    const elapsedMs = Math.max(0, effectiveEnd.getTime() - created.getTime());
    const elapsedHours = Math.round((elapsedMs / (1000 * 60 * 60)) * 10) / 10;

    const remainingMs = deadline.getTime() - effectiveEnd.getTime();
    const remainingHours = Math.round((remainingMs / (1000 * 60 * 60)) * 10) / 10;

    const progressPercentage = Math.min(100, Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100)));

    const isResolved = grievance.status === GrievanceStatus.RESOLVED;
    const isBreached = resolvedAt ? resolvedAt > deadline : now > deadline;

    const warningThreshold = SLA_CONFIG[grievance.priority]?.warningThresholdPercentage || 0.75;
    const isWarning = !isResolved && !isBreached && progressPercentage >= warningThreshold * 100;

    let slaState: SlaStatusDetail["slaState"] = "ON_TRACK";
    if (isResolved) {
      slaState = isBreached ? "RESOLVED_OVERDUE" : "RESOLVED_ON_TIME";
    } else if (isBreached) {
      slaState = "BREACHED";
    } else if (isWarning) {
      slaState = "WARNING";
    }

    // Get highest active escalation level
    let currentEscalationLevel: EscalationLevel | null = null;
    if (grievance.escalations && grievance.escalations.length > 0) {
      currentEscalationLevel = grievance.escalations[0].escalationLevel;
    }

    // Citizen-friendly status text
    let citizenFriendlyStatus = "Complaint is being investigated within the designated timeline.";
    if (isResolved) {
      citizenFriendlyStatus = "Complaint has been successfully resolved and verified.";
    } else if (currentEscalationLevel === EscalationLevel.LEVEL_3_DISTRICT_MAGISTRATE) {
      citizenFriendlyStatus = "Escalated to District Magistrate Office for direct supervisory review.";
    } else if (currentEscalationLevel === EscalationLevel.LEVEL_2_HOD) {
      citizenFriendlyStatus = "Escalated to Department Head for expedited resolution.";
    } else if (currentEscalationLevel === EscalationLevel.LEVEL_1_SUPERVISOR || isBreached) {
      citizenFriendlyStatus = "Resolution window exceeded. Automatically escalated to Senior Supervisor.";
    } else if (isWarning) {
      citizenFriendlyStatus = "Under active investigation by assigned officer — approaching resolution window.";
    }

    return {
      totalHours,
      elapsedHours,
      remainingHours,
      progressPercentage,
      isBreached,
      isWarning,
      slaState,
      slaDeadline: deadline,
      currentEscalationLevel,
      citizenFriendlyStatus,
    };
  }

  /**
   * 3. detectAndProcessOverdueGrievances()
   * Scans overdue complaints, triggers tiered auto-escalations, records audit logs, and notifies supervisors
   */
  static async detectAndProcessOverdueGrievances(): Promise<{
    scanned: number;
    breached: number;
    escalatedLevel1: number;
    escalatedLevel2: number;
    escalatedLevel3: number;
  }> {
    const now = new Date();
    logger.info("[SLA Engine] Running scheduled SLA breach and overdue detection scan...");

    let breachedCount = 0;
    let level1Count = 0;
    let level2Count = 0;
    let level3Count = 0;

    // Find all active unresolved grievances whose deadline has passed
    const overdueGrievances = await prisma.grievance.findMany({
      where: {
        slaDeadline: { lt: now },
        status: {
          notIn: [GrievanceStatus.RESOLVED, GrievanceStatus.REJECTED],
        },
      },
      include: {
        department: true,
        citizen: { select: { id: true, fullName: true, email: true } },
        assignments: {
          where: { isActive: true },
          include: { officerProfile: { include: { user: true } } },
        },
        escalations: {
          orderBy: { triggeredAt: "desc" },
        },
      },
    });

    for (const g of overdueGrievances) {
      try {
        breachedCount++;

        // 1. Mark SLA Breached flag on grievance if not already set
        if (!g.slaBreached) {
          await prisma.grievance.update({
            where: { id: g.id },
            data: { slaBreached: true },
          });
        }

        const latestEscalation = g.escalations && g.escalations.length > 0 ? g.escalations[0] : null;

        // Tier A: No Escalation -> Trigger LEVEL_1_SUPERVISOR
        if (!latestEscalation) {
          level1Count++;
          await prisma.$transaction(async (tx) => {
            // Find senior officers in the department
            const seniorOfficer = await tx.officerProfile.findFirst({
              where: {
                departmentId: g.departmentId || undefined,
                user: { role: { in: ["SENIOR_OFFICER", "ADMIN"] } },
              },
            });

            await tx.escalation.create({
              data: {
                grievanceId: g.id,
                escalationLevel: EscalationLevel.LEVEL_1_SUPERVISOR,
                status: EscalationStatus.TRIGGERED,
                reason: `Automated SLA breach detected. Target deadline elapsed on ${g.slaDeadline?.toISOString()}. Assigned to Senior Officer for supervisory oversight.`,
                escalatedToUserId: seniorOfficer?.userId || null,
              },
            });

            await tx.grievance.update({
              where: { id: g.id },
              data: {
                isEscalated: true,
                status: GrievanceStatus.ESCALATED,
              },
            });

            await tx.grievanceStatusHistory.create({
              data: {
                grievanceId: g.id,
                actionTaken: "SLA_BREACH_AUTOMATICALLY_ESCALATED_LEVEL_1",
                previousStatus: g.status,
                newStatus: GrievanceStatus.ESCALATED,
                remarks: `SLA resolution deadline expired. System automatically escalated case to Level 1 Senior Supervisor.`,
              },
            });

            await tx.auditLog.create({
              data: {
                action: "ESCALATION_LEVEL_1_TRIGGERED",
                entityType: "Grievance",
                entityId: g.id,
                metadata: {
                  trackingNumber: g.trackingNumber,
                  slaDeadline: g.slaDeadline,
                  breachDetectedAt: now.toISOString(),
                },
              },
            });

            // Notify Citizen
            await tx.notification.create({
              data: {
                recipientId: g.citizenId,
                type: NotificationType.ESCALATION_TRIGGERED,
                title: `Grievance Escalated: ${g.trackingNumber}`,
                message: `Your grievance ${g.trackingNumber} has exceeded the initial resolution window and has been automatically escalated to a Senior Departmental Officer for expedited action.`,
                linkUrl: `/citizen/grievances/${g.id}`,
              },
            });

            // Notify Assigned Field Officer
            if (g.assignments && g.assignments.length > 0) {
              const officerUserId = g.assignments[0].officerProfile.userId;
              await tx.notification.create({
                data: {
                  recipientId: officerUserId,
                  type: NotificationType.SLA_BREACH_WARNING,
                  title: `🚨 SLA Breached: ${g.trackingNumber}`,
                  message: `Grievance ${g.trackingNumber} is overdue and has been escalated to your Senior Supervisor. Immediate rectification required.`,
                  linkUrl: `/officer/grievances/${g.id}`,
                },
              });
            }
          });
        }
        // Tier B: Level 1 exists -> Trigger LEVEL_2_HOD after 24h grace
        else if (
          latestEscalation.escalationLevel === EscalationLevel.LEVEL_1_SUPERVISOR &&
          now.getTime() - new Date(latestEscalation.triggeredAt).getTime() > 24 * 3600 * 1000
        ) {
          level2Count++;
          await prisma.$transaction(async (tx) => {
            await tx.escalation.create({
              data: {
                grievanceId: g.id,
                escalationLevel: EscalationLevel.LEVEL_2_HOD,
                status: EscalationStatus.TRIGGERED,
                reason: `Level 1 grace period (24 hours) expired without resolution. Escalated directly to Head of Department.`,
              },
            });

            await tx.grievanceStatusHistory.create({
              data: {
                grievanceId: g.id,
                actionTaken: "SLA_BREACH_AUTOMATICALLY_ESCALATED_LEVEL_2",
                previousStatus: g.status,
                newStatus: GrievanceStatus.ESCALATED,
                remarks: `Delay continues unaddressed for >24h past first breach. Case escalated to Department Head.`,
              },
            });

            await tx.auditLog.create({
              data: {
                action: "ESCALATION_LEVEL_2_TRIGGERED",
                entityType: "Grievance",
                entityId: g.id,
                metadata: { trackingNumber: g.trackingNumber },
              },
            });
          });
        }
        // Tier C: Level 2 exists -> Trigger LEVEL_3_DISTRICT_MAGISTRATE after 24h grace
        else if (
          latestEscalation.escalationLevel === EscalationLevel.LEVEL_2_HOD &&
          now.getTime() - new Date(latestEscalation.triggeredAt).getTime() > 24 * 3600 * 1000
        ) {
          level3Count++;
          await prisma.$transaction(async (tx) => {
            await tx.escalation.create({
              data: {
                grievanceId: g.id,
                escalationLevel: EscalationLevel.LEVEL_3_DISTRICT_MAGISTRATE,
                status: EscalationStatus.TRIGGERED,
                reason: `Severe unresolved delay. Escalated to District Magistrate Secretariat for statutory administrative intervention.`,
              },
            });

            await tx.grievanceStatusHistory.create({
              data: {
                grievanceId: g.id,
                actionTaken: "SLA_BREACH_AUTOMATICALLY_ESCALATED_LEVEL_3",
                previousStatus: g.status,
                newStatus: GrievanceStatus.ESCALATED,
                remarks: `Final escalation to District Magistrate / Ministry Office.`,
              },
            });

            await tx.auditLog.create({
              data: {
                action: "ESCALATION_LEVEL_3_TRIGGERED",
                entityType: "Grievance",
                entityId: g.id,
                metadata: { trackingNumber: g.trackingNumber },
              },
            });
          });
        }
      } catch (err: any) {
        logger.error(`[SLA Engine] Error processing escalation for ${g.trackingNumber}: ${err.message}`);
      }
    }

    logger.info(
      `[SLA Engine] Scan complete: ${overdueGrievances.length} scanned, ${breachedCount} breached, ${level1Count} escalated to L1, ${level2Count} escalated to L2, ${level3Count} escalated to L3.`
    );

    return {
      scanned: overdueGrievances.length,
      breached: breachedCount,
      escalatedLevel1: level1Count,
      escalatedLevel2: level2Count,
      escalatedLevel3: level3Count,
    };
  }

  /**
   * 4. triggerManualEscalation()
   * Allows manual escalation by citizen or supervisor with justification
   */
  static async triggerManualEscalation(
    grievanceId: string,
    actorId: string,
    reason: string
  ): Promise<any> {
    const grievance = await prisma.grievance.findUnique({
      where: { id: grievanceId },
      include: {
        escalations: { orderBy: { triggeredAt: "desc" } },
        assignments: { where: { isActive: true }, include: { officerProfile: true } },
      },
    });

    if (!grievance) {
      throw new Error("Grievance record not found");
    }

    if (grievance.status === GrievanceStatus.RESOLVED) {
      throw new Error("Cannot escalate an already resolved grievance");
    }

    return await prisma.$transaction(async (tx) => {
      const escalation = await tx.escalation.create({
        data: {
          grievanceId,
          escalationLevel: EscalationLevel.LEVEL_1_SUPERVISOR,
          status: EscalationStatus.TRIGGERED,
          reason,
          triggeredById: actorId,
        },
      });

      await tx.grievance.update({
        where: { id: grievanceId },
        data: {
          isEscalated: true,
          status: GrievanceStatus.ESCALATED,
        },
      });

      await tx.grievanceStatusHistory.create({
        data: {
          grievanceId,
          actorId,
          actionTaken: "MANUAL_ESCALATION_TRIGGERED",
          previousStatus: grievance.status,
          newStatus: GrievanceStatus.ESCALATED,
          remarks: `Manual escalation requested: ${reason}`,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId,
          action: "MANUAL_ESCALATION_TRIGGERED",
          entityType: "Grievance",
          entityId: grievanceId,
          metadata: { reason },
        },
      });

      return escalation;
    });
  }
}

export default SlaService;
