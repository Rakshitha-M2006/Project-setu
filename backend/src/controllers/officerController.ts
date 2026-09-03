import { Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import { AuthenticatedRequest } from "../types";
import { GrievanceStatus, Priority, NotificationType, StorageProvider } from "@prisma/client";

// Input Validation Schemas
export const updateOfficerStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      "ASSIGNED",
      "IN_PROGRESS",
      "UNDER_INSPECTION",
      "RESOLVED",
      "REJECTED",
      "ESCALATED",
    ]),
    remarks: z.string().min(3, "Remarks must be at least 3 characters").max(2000),
    resolutionSummary: z.string().max(2000).optional().nullable(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export const requestInfoSchema = z.object({
  body: z.object({
    message: z.string().min(5, "Information request message must be at least 5 characters").max(1000),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export const uploadEvidenceSchema = z.object({
  body: z.object({
    fileName: z.string(),
    originalName: z.string(),
    fileUrl: z.string().url("Must be a valid file URL"),
    mimeType: z.string(),
    fileSizeBytes: z.number().int().nonnegative(),
    remarks: z.string().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export class OfficerController {
  /**
   * Helper: Resolves the officer profile and department for the current user
   */
  private static async getOfficerContext(userId: string) {
    const profile = await prisma.officerProfile.findUnique({
      where: { userId },
      include: { department: true, location: true },
    });

    if (!profile) {
      throw ApiError.forbidden("Officer profile record not found for this account");
    }

    return profile;
  }

  /**
   * GET /api/v1/officer/dashboard-stats
   * Comprehensive metrics for the officer portal dashboard
   */
  async getDashboardStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const officer = await OfficerController.getOfficerContext(userId);
      const deptId = officer.departmentId;

      // Base query for officer's assigned complaints
      const assignedCondition = {
        assignments: {
          some: {
            officerProfileId: officer.id,
            isActive: true,
          },
        },
      };

      // 1. Total Assigned to this officer
      const totalAssigned = await prisma.grievance.count({
        where: assignedCondition,
      });

      // 2. Pending grievances (Assigned or Officer Pending)
      const pendingCount = await prisma.grievance.count({
        where: {
          ...assignedCondition,
          status: { in: [GrievanceStatus.ASSIGNED, GrievanceStatus.OFFICER_PENDING, GrievanceStatus.DEPARTMENT_ASSIGNED] },
        },
      });

      // 3. In Progress grievances
      const inProgressCount = await prisma.grievance.count({
        where: {
          ...assignedCondition,
          status: { in: [GrievanceStatus.IN_PROGRESS, GrievanceStatus.UNDER_INSPECTION] },
        },
      });

      // 4. Resolved grievances
      const resolvedCount = await prisma.grievance.count({
        where: {
          ...assignedCondition,
          status: GrievanceStatus.RESOLVED,
        },
      });

      // 5. High / Critical Priority
      const highPriorityCount = await prisma.grievance.count({
        where: {
          ...assignedCondition,
          priority: { in: [Priority.HIGH, Priority.CRITICAL] },
          status: { not: GrievanceStatus.RESOLVED },
        },
      });

      // 6. Overdue / SLA Breached
      const overdueCount = await prisma.grievance.count({
        where: {
          ...assignedCondition,
          slaDeadline: { lt: new Date() },
          status: { not: GrievanceStatus.RESOLVED },
        },
      });

      // 7. Department-level unassigned backlog (available for officer to accept)
      const departmentUnassignedCount = await prisma.grievance.count({
        where: {
          departmentId: deptId,
          status: { in: [GrievanceStatus.DEPARTMENT_ASSIGNED, GrievanceStatus.OFFICER_PENDING] },
          assignments: { none: { isActive: true } },
        },
      });

      // 8. Recent 5 grievances for dashboard feed
      const recentGrievances = await prisma.grievance.findMany({
        where: {
          OR: [
            assignedCondition,
            {
              departmentId: deptId,
              status: { in: [GrievanceStatus.DEPARTMENT_ASSIGNED, GrievanceStatus.OFFICER_PENDING] },
            },
          ],
        },
        include: {
          category: { select: { id: true, name: true } },
          citizen: { select: { id: true, fullName: true, phone: true } },
          location: true,
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      });

      ApiResponse.success(
        res,
        {
          metrics: {
            totalAssigned,
            pending: pendingCount,
            inProgress: inProgressCount,
            resolved: resolvedCount,
            highPriority: highPriorityCount,
            overdue: overdueCount,
            departmentUnassigned: departmentUnassignedCount,
          },
          officer: {
            id: officer.id,
            badgeNumber: officer.badgeNumber,
            designation: officer.designation,
            jurisdictionWard: officer.jurisdictionWard,
            department: officer.department.name,
            departmentCode: officer.department.code,
            isAvailable: officer.isAvailable,
          },
          recentGrievances,
        },
        "Officer dashboard metrics retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/officer/grievances
   * List grievances with search, status/priority/category filters, sorting, and pagination
   */
  async getOfficerGrievances(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const officer = await OfficerController.getOfficerContext(userId);

      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
      const skip = (page - 1) * limit;

      const { status, priority, categoryId, search, scope, sortBy = "createdAt", sortOrder = "desc" } = req.query;

      // Base query scoped to officer's department or assigned complaints
      const whereClause: any = {};

      if (scope === "assigned_to_me") {
        whereClause.assignments = {
          some: { officerProfileId: officer.id, isActive: true },
        };
      } else if (scope === "department_unassigned") {
        whereClause.departmentId = officer.departmentId;
        whereClause.status = { in: [GrievanceStatus.DEPARTMENT_ASSIGNED, GrievanceStatus.OFFICER_PENDING] };
        whereClause.assignments = { none: { isActive: true } };
      } else {
        // Default: All departmental complaints
        whereClause.OR = [
          { departmentId: officer.departmentId },
          { assignments: { some: { officerProfileId: officer.id, isActive: true } } },
        ];
      }

      // Filters
      if (status && status !== "ALL") {
        whereClause.status = status as GrievanceStatus;
      }
      if (priority && priority !== "ALL") {
        whereClause.priority = priority as Priority;
      }
      if (categoryId && categoryId !== "ALL") {
        whereClause.categoryId = categoryId as string;
      }
      if (search && typeof search === "string" && search.trim()) {
        const q = search.trim();
        whereClause.AND = [
          {
            OR: [
              { trackingNumber: { contains: q } },
              { title: { contains: q } },
              { description: { contains: q } },
              { citizen: { fullName: { contains: q } } },
              { addressText: { contains: q } },
              { pincode: { contains: q } },
            ],
          },
        ];
      }

      const totalItems = await prisma.grievance.count({ where: whereClause });

      const items = await prisma.grievance.findMany({
        where: whereClause,
        include: {
          category: { select: { id: true, name: true, code: true } },
          department: { select: { id: true, name: true, code: true } },
          citizen: { select: { id: true, fullName: true, phone: true, email: true } },
          location: true,
          assignments: {
            where: { isActive: true },
            include: {
              officerProfile: {
                include: { user: { select: { id: true, fullName: true, email: true } } },
              },
            },
          },
          _count: {
            select: { attachments: true, statusHistories: true },
          },
        },
        orderBy: { [sortBy as string]: sortOrder === "asc" ? "asc" : "desc" },
        skip,
        take: limit,
      });

      const totalPages = Math.ceil(totalItems / limit);

      ApiResponse.success(
        res,
        {
          items,
          pagination: {
            totalItems,
            totalPages,
            currentPage: page,
            pageSize: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
        "Grievances retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/officer/grievances/:id
   * Complete grievance audit inspection with strict departmental access check
   */
  async getGrievanceById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const officer = await OfficerController.getOfficerContext(userId);

      const grievance = await prisma.grievance.findFirst({
        where: {
          OR: [{ id }, { trackingNumber: id }],
        },
        include: {
          department: true,
          category: true,
          location: true,
          citizen: {
            select: { id: true, fullName: true, email: true, phone: true, createdAt: true },
          },
          attachments: {
            orderBy: { uploadedAt: "desc" },
          },
          aiClassification: true,
          assignments: {
            include: {
              officerProfile: {
                include: { user: { select: { id: true, fullName: true, email: true, phone: true } } },
              },
              assignedBy: { select: { id: true, fullName: true, role: true } },
            },
          },
          statusHistories: {
            include: {
              actor: { select: { id: true, fullName: true, role: true } },
            },
            orderBy: { createdAt: "desc" },
          },
          escalations: {
            orderBy: { triggeredAt: "desc" },
          },
          feedback: true,
        },
      });

      if (!grievance) {
        throw ApiError.notFound("Grievance not found in official registry");
      }

      // Security check: Officer must belong to the department OR be assigned
      const isAssigned = grievance.assignments.some(
        (a) => a.officerProfile.userId === userId && a.isActive
      );
      const isSameDepartment = grievance.departmentId === officer.departmentId;

      if (!isAssigned && !isSameDepartment && req.user!.role !== "ADMIN") {
        throw ApiError.forbidden("You do not have departmental authorization to inspect this grievance");
      }

      ApiResponse.success(res, grievance, "Grievance details retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/officer/grievances/:id/accept
   * Officer claims/accepts responsibility for a grievance
   */
  async acceptGrievance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const officer = await OfficerController.getOfficerContext(userId);

      const grievance = await prisma.grievance.findUnique({
        where: { id },
        include: { department: true },
      });

      if (!grievance) {
        throw ApiError.notFound("Grievance not found");
      }

      // Department check
      if (grievance.departmentId && grievance.departmentId !== officer.departmentId) {
        throw ApiError.forbidden("Cannot accept grievance belonging to another department");
      }

      const updated = await prisma.$transaction(async (tx) => {
        // Deactivate any existing active assignment
        await tx.grievanceAssignment.updateMany({
          where: { grievanceId: id, isActive: true },
          data: { isActive: false, unassignedAt: new Date() },
        });

        // Create new active assignment
        await tx.grievanceAssignment.create({
          data: {
            grievanceId: id,
            officerProfileId: officer.id,
            assignedById: userId,
            assignmentNotes: `Self-accepted and claimed by Officer ${req.user!.fullName} (${officer.badgeNumber || officer.designation}).`,
            isActive: true,
          },
        });

        // Update grievance status to IN_PROGRESS or ASSIGNED
        const g = await tx.grievance.update({
          where: { id },
          data: {
            status: GrievanceStatus.IN_PROGRESS,
            departmentId: officer.departmentId, // Ensure department set
          },
        });

        // Increment officer active count
        await tx.officerProfile.update({
          where: { id: officer.id },
          data: { activeGrievanceCount: { increment: 1 } },
        });

        // Add Status History
        await tx.grievanceStatusHistory.create({
          data: {
            grievanceId: id,
            actorId: userId,
            actionTaken: "OFFICER_ACCEPTED_GRIEVANCE",
            previousStatus: grievance.status,
            newStatus: GrievanceStatus.IN_PROGRESS,
            remarks: `Officer ${req.user!.fullName} accepted grievance and initiated field investigation.`,
          },
        });

        // Add Audit Log
        await tx.auditLog.create({
          data: {
            actorId: userId,
            action: "OFFICER_ACCEPTED_GRIEVANCE",
            entityType: "Grievance",
            entityId: id,
            metadata: {
              officerId: officer.id,
              badgeNumber: officer.badgeNumber,
              trackingNumber: grievance.trackingNumber,
            },
          },
        });

        // Notify Citizen
        await tx.notification.create({
          data: {
            recipientId: grievance.citizenId,
            type: NotificationType.OFFICER_ASSIGNED,
            title: `Officer Assigned: ${grievance.trackingNumber}`,
            message: `Officer ${req.user!.fullName} (${officer.designation}) has been assigned to your grievance and is actively investigating.`,
            linkUrl: `/citizen/grievances/${id}`,
          },
        });

        return g;
      });

      ApiResponse.success(res, updated, "Grievance successfully accepted and assigned to you");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/officer/grievances/:id/status
   * Update grievance status with remarks and resolution evidence
   */
  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, remarks, resolutionSummary } = req.body;
      const userId = req.user!.id;
      const officer = await OfficerController.getOfficerContext(userId);

      const grievance = await prisma.grievance.findUnique({
        where: { id },
      });

      if (!grievance) {
        throw ApiError.notFound("Grievance not found");
      }

      const isResolved = status === GrievanceStatus.RESOLVED;

      const updated = await prisma.$transaction(async (tx) => {
        const g = await tx.grievance.update({
          where: { id },
          data: {
            status: status as GrievanceStatus,
            resolutionSummary: isResolved ? (resolutionSummary || remarks) : grievance.resolutionSummary,
            resolvedAt: isResolved ? new Date() : grievance.resolvedAt,
            closedAt: isResolved ? new Date() : grievance.closedAt,
          },
        });

        // If resolved, update officer stats
        if (isResolved && grievance.status !== GrievanceStatus.RESOLVED) {
          await tx.officerProfile.update({
            where: { id: officer.id },
            data: {
              activeGrievanceCount: { decrement: 1 },
              resolvedGrievanceCount: { increment: 1 },
            },
          });
        }

        // Add Status History
        await tx.grievanceStatusHistory.create({
          data: {
            grievanceId: id,
            actorId: userId,
            actionTaken: `STATUS_UPDATED_TO_${status}`,
            previousStatus: grievance.status,
            newStatus: status as GrievanceStatus,
            remarks: remarks || `Status updated to ${status}`,
          },
        });

        // Add Audit Log
        await tx.auditLog.create({
          data: {
            actorId: userId,
            action: `GRIEVANCE_STATUS_UPDATED_${status}`,
            entityType: "Grievance",
            entityId: id,
            changes: {
              previousStatus: grievance.status,
              newStatus: status,
              remarks,
              resolutionSummary,
            },
          },
        });

        // Notify Citizen
        await tx.notification.create({
          data: {
            recipientId: grievance.citizenId,
            type: NotificationType.GRIEVANCE_STATUS_UPDATE,
            title: `Grievance Status: ${status.replace(/_/g, " ")}`,
            message: `Your grievance ${grievance.trackingNumber} has been updated to ${status.replace(/_/g, " ")}. Remarks: ${remarks}`,
            linkUrl: `/citizen/grievances/${id}`,
          },
        });

        return g;
      });

      ApiResponse.success(res, updated, `Grievance status successfully updated to ${status}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/officer/grievances/:id/evidence
   * Upload resolution photo or inspection report
   */
  async uploadEvidence(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { fileName, originalName, fileUrl, mimeType, fileSizeBytes, remarks } = req.body;
      const userId = req.user!.id;

      const grievance = await prisma.grievance.findUnique({ where: { id } });
      if (!grievance) {
        throw ApiError.notFound("Grievance not found");
      }

      const attachment = await prisma.$transaction(async (tx) => {
        const att = await tx.grievanceAttachment.create({
          data: {
            grievanceId: id,
            uploadedById: userId,
            fileName,
            originalName,
            fileUrl,
            mimeType,
            fileSizeBytes,
            storageProvider: StorageProvider.LOCAL,
            isResolutionEvidence: true,
          },
        });

        // Log in status history
        await tx.grievanceStatusHistory.create({
          data: {
            grievanceId: id,
            actorId: userId,
            actionTaken: "RESOLUTION_EVIDENCE_UPLOADED",
            previousStatus: grievance.status,
            newStatus: grievance.status,
            remarks: remarks || `Officer uploaded verification evidence: ${originalName}`,
          },
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            actorId: userId,
            action: "OFFICER_UPLOADED_EVIDENCE",
            entityType: "GrievanceAttachment",
            entityId: att.id,
            metadata: { grievanceId: id, fileName: originalName },
          },
        });

        return att;
      });

      ApiResponse.created(res, attachment, "Verification evidence uploaded successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/officer/grievances/:id/request-info
   * Request additional information or clarification from the citizen
   */
  async requestInfo(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { message } = req.body;
      const userId = req.user!.id;

      const grievance = await prisma.grievance.findUnique({ where: { id } });
      if (!grievance) {
        throw ApiError.notFound("Grievance not found");
      }

      await prisma.$transaction(async (tx) => {
        // Status history entry
        await tx.grievanceStatusHistory.create({
          data: {
            grievanceId: id,
            actorId: userId,
            actionTaken: "ADDITIONAL_INFO_REQUESTED",
            previousStatus: grievance.status,
            newStatus: grievance.status,
            remarks: `Officer Request: ${message}`,
          },
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            actorId: userId,
            action: "OFFICER_REQUESTED_INFO",
            entityType: "Grievance",
            entityId: id,
            metadata: { message },
          },
        });

        // High Priority Citizen Notification
        await tx.notification.create({
          data: {
            recipientId: grievance.citizenId,
            type: NotificationType.GRIEVANCE_STATUS_UPDATE,
            title: `Action Required on ${grievance.trackingNumber}`,
            message: `The investigating officer has requested additional details: "${message}". Please open your grievance page to respond.`,
            linkUrl: `/citizen/grievances/${id}`,
          },
        });
      });

      ApiResponse.success(res, null, "Information request dispatched to citizen");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/officer/profile
   * Fetch current officer's profile details
   */
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const profile = await prisma.officerProfile.findUnique({
        where: { userId },
        include: {
          user: { select: { id: true, email: true, phone: true, fullName: true, role: true } },
          department: true,
          location: true,
        },
      });

      if (!profile) {
        throw ApiError.notFound("Officer profile not found");
      }

      ApiResponse.success(res, profile, "Officer profile retrieved");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/officer/profile
   * Update officer profile details & availability toggle
   */
  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { isAvailable, designation, phone, jurisdictionWard } = req.body;

      const profile = await prisma.officerProfile.findUnique({ where: { userId } });
      if (!profile) {
        throw ApiError.notFound("Officer profile not found");
      }

      const updated = await prisma.$transaction(async (tx) => {
        if (phone) {
          await tx.user.update({
            where: { id: userId },
            data: { phone },
          });
        }

        const p = await tx.officerProfile.update({
          where: { userId },
          data: {
            isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : profile.isAvailable,
            designation: designation || profile.designation,
            jurisdictionWard: jurisdictionWard || profile.jurisdictionWard,
          },
          include: {
            department: true,
            user: { select: { id: true, email: true, phone: true, fullName: true, role: true } },
          },
        });

        await tx.auditLog.create({
          data: {
            actorId: userId,
            action: "OFFICER_PROFILE_UPDATED",
            entityType: "OfficerProfile",
            entityId: profile.id,
            changes: { isAvailable, designation, phone, jurisdictionWard },
          },
        });

        return p;
      });

      ApiResponse.success(res, updated, "Officer profile updated successfully");
    } catch (error) {
      next(error);
    }
  }
}

export const officerController = new OfficerController();
export default officerController;
