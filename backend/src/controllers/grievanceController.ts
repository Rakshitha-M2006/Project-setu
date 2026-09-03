import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { env } from "../config/env";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import { GrievanceWorkflowService } from "../services/grievanceWorkflowService";
import { AuthenticatedRequest } from "../types";
import { Priority, GrievanceStatus, NotificationType, StorageProvider } from "@prisma/client";

// Input Validation Schema for Grievance Submission
export const createGrievanceSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title cannot exceed 200 characters"),
    description: z.string().min(10, "Description must be at least 10 characters").max(5000, "Description cannot exceed 5000 characters"),
    categoryId: z.string().optional().nullable(),
    departmentId: z.string().optional().nullable(),
    addressText: z.string().max(500).optional().nullable(),
    pincode: z
      .string()
      .regex(/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit Indian PIN code")
      .optional()
      .nullable()
      .or(z.literal("")),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    locality: z.string().max(200).optional().nullable(),
    district: z.string().max(100).optional().nullable(),
    state: z.string().max(100).optional().nullable(),
    additionalDetails: z.string().max(2000).optional().nullable(),
    attachments: z
      .array(
        z.object({
          fileName: z.string(),
          originalName: z.string(),
          fileUrl: z.string(),
          mimeType: z.string(),
          fileSizeBytes: z.number().int().nonnegative(),
        })
      )
      .optional(),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      "SUBMITTED",
      "AI_CLASSIFIED",
      "DEPARTMENT_ASSIGNED",
      "OFFICER_PENDING",
      "AI_REVIEW_REQUIRED",
      "NEEDS_REVIEW",
      "AI_TRIAGED",
      "ASSIGNED",
      "IN_PROGRESS",
      "UNDER_INSPECTION",
      "RESOLVED",
      "REJECTED",
      "ESCALATED",
      "REOPENED",
    ]),
    remarks: z.string().optional(),
    resolutionSummary: z.string().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

/**
 * Helper to generate human-readable department prefix for reference tokens
 */
const getDepartmentPrefix = (deptCode?: string | null): string => {
  if (!deptCode) return "GEN";
  const upper = deptCode.toUpperCase();
  if (upper.includes("WATER") || upper.includes("WTR")) return "WTR";
  if (upper.includes("ELEC") || upper.includes("POWER") || upper.includes("ELC")) return "ELC";
  if (upper.includes("ROAD") || upper.includes("PWD") || upper.includes("WORKS")) return "PWD";
  if (upper.includes("HEALTH") || upper.includes("HLT") || upper.includes("MED") || upper.includes("SAN")) return "HLT";
  if (upper.includes("REV") || upper.includes("LAND")) return "REV";
  if (upper.includes("WOMEN") || upper.includes("CHILD") || upper.includes("WCD")) return "WCD";
  return upper.slice(0, 3);
};

export class GrievanceController {
  /**
   * POST /api/v1/grievances
   * Complete grievance submission workflow with AI classification, automatic department routing,
   * status lifecycle management, and citizen notification.
   */
  async submitGrievance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const citizenId = req.user!.id;
      const {
        title,
        description,
        categoryId,
        departmentId,
        addressText,
        pincode,
        latitude,
        longitude,
        locality,
        district,
        state,
        additionalDetails,
        attachments,
      } = req.body;

      // 1. Classify Grievance via AI Microservice
      const aiAnalysis = await GrievanceWorkflowService.classifyGrievance(
        title,
        description,
        addressText || locality,
        pincode
      );

      // 2. Perform Automatic Department Routing Decision
      const routingDecision = await GrievanceWorkflowService.routeGrievance(
        aiAnalysis,
        departmentId,
        categoryId
      );

      // 3. Calculate Final Priority and SLA Turnaround
      const priorityAndSla = GrievanceWorkflowService.calculatePriority(aiAnalysis);

      // 4. Generate Human-Readable Reference Token (e.g. SETU-2026-ELC-001245)
      const prefix = getDepartmentPrefix(routingDecision.departmentCode);
      const currentYear = new Date().getFullYear();
      const randomSeq = String(Math.floor(100000 + Math.random() * 900000));
      const trackingNumber = `SETU-${currentYear}-${prefix}-${randomSeq}`;

      // 5. Build Status Lifecycle History Entries
      const statusHistoryEntries = GrievanceWorkflowService.getLifecycleHistoryEntries(
        citizenId,
        routingDecision,
        aiAnalysis,
        priorityAndSla
      );

      // 6. Resolve or create Location entity if coordinates or address provided
      let locationId: string | null = null;
      if (latitude || longitude || pincode || district || state) {
        const newLocation = await prisma.location.create({
          data: {
            state: state || "National Capital Region",
            district: district || "Central Zone",
            pincode: pincode && pincode.trim() ? pincode.trim() : "110001",
            locality: locality || addressText || null,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
          },
        });
        locationId = newLocation.id;
      }

      const finalDescription = additionalDetails
        ? `${description}\n\n[Additional Details]: ${additionalDetails}`
        : description;

      // 7. Atomic Database Transaction
      const grievance = await prisma.$transaction(async (tx) => {
        const created = await tx.grievance.create({
          data: {
            trackingNumber,
            citizenId,
            departmentId: routingDecision.departmentId,
            categoryId: routingDecision.categoryId,
            locationId,
            title: title.trim(),
            description: finalDescription.trim(),
            addressText: addressText ? addressText.trim() : null,
            pincode: pincode && pincode.trim() ? pincode.trim() : null,
            status: routingDecision.targetStatus,
            priority: priorityAndSla.priority,
            isUrgent: priorityAndSla.isUrgent,
            slaDeadline: priorityAndSla.slaDeadline,
            aiClassification: {
              create: {
                predictedDepartmentId: routingDecision.departmentId,
                predictedDepartmentCode: aiAnalysis.department_code,
                confidenceScore: aiAnalysis.confidence_score,
                priorityScore: priorityAndSla.priority,
                detectedSentiment: aiAnalysis.sentiment,
                extractedKeywords: aiAnalysis.extracted_keywords,
                suggestedSlaHours: priorityAndSla.slaHours,
                modelVersion: aiAnalysis.model_version || "1.0.0-nlp-rules",
                rawInference: {
                  summary: aiAnalysis.summary,
                  issue_type: aiAnalysis.issue_type,
                  can_auto_route: routingDecision.canAutoRoute,
                  routing_reason: routingDecision.routingReason,
                  confidence_threshold: env.AI_CONFIDENCE_THRESHOLD,
                },
              },
            },
            statusHistories: {
              create: statusHistoryEntries.map((entry) => ({
                actorId: entry.actorId,
                actionTaken: entry.actionTaken,
                previousStatus: entry.previousStatus,
                newStatus: entry.newStatus,
                remarks: entry.remarks,
              })),
            },
            attachments: attachments && attachments.length > 0
              ? {
                  create: attachments.map((att: any) => ({
                    uploadedById: citizenId,
                    fileName: att.fileName,
                    originalName: att.originalName,
                    fileUrl: att.fileUrl,
                    mimeType: att.mimeType,
                    fileSizeBytes: att.fileSizeBytes || 0,
                    storageProvider: StorageProvider.LOCAL,
                  })),
                }
              : undefined,
          },
          include: {
            department: true,
            category: true,
            location: true,
            aiClassification: true,
            attachments: true,
            statusHistories: {
              orderBy: { createdAt: "asc" },
            },
          },
        });

        // 8. Create Notification for Citizen
        await tx.notification.create({
          data: {
            recipientId: citizenId,
            type: NotificationType.GRIEVANCE_STATUS_UPDATE,
            title: `Grievance Lodged: ${trackingNumber}`,
            message: `Your grievance '${title}' has been registered under reference ${trackingNumber}. Routed to: ${routingDecision.departmentName}, Priority: ${priorityAndSla.priority}, Target SLA: ${priorityAndSla.slaHours} hrs.`,
            linkUrl: `/citizen/grievances/${created.id}`,
          },
        });

        return created;
      });

      // 9. Return structured, sanitized payload for the citizen UI
      ApiResponse.created(
        res,
        {
          grievance,
          trackingNumber: grievance.trackingNumber,
          category: grievance.category?.name || aiAnalysis.category,
          department: grievance.department?.name || routingDecision.departmentName,
          priority: grievance.priority,
          status: grievance.status,
          slaDeadline: grievance.slaDeadline,
          requiresHumanReview: routingDecision.requiresHumanReview,
        },
        "Grievance submitted and routed successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/grievances/my
   * Get all grievances belonging strictly to current authenticated citizen
   */
  async getMyGrievances(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const citizenId = req.user!.id;
      const { status, priority, search } = req.query;

      const whereClause: any = { citizenId };

      if (status && status !== "ALL") {
        whereClause.status = status as GrievanceStatus;
      }
      if (priority && priority !== "ALL") {
        whereClause.priority = priority as Priority;
      }
      if (search && typeof search === "string" && search.trim()) {
        const query = search.trim();
        whereClause.OR = [
          { trackingNumber: { contains: query } },
          { title: { contains: query } },
          { description: { contains: query } },
        ];
      }

      const grievances = await prisma.grievance.findMany({
        where: whereClause,
        include: {
          department: { select: { id: true, name: true, code: true } },
          category: { select: { id: true, name: true, code: true } },
          location: true,
          aiClassification: {
            select: {
              confidenceScore: true,
              priorityScore: true,
              detectedSentiment: true,
              suggestedSlaHours: true,
            },
          },
          attachments: true,
          statusHistories: {
            orderBy: { createdAt: "asc" },
          },
          feedback: true,
        },
        orderBy: { createdAt: "desc" },
      });

      ApiResponse.success(res, grievances, "Citizen grievances retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/grievances/:id
   * Retrieve detailed grievance by ID or trackingNumber with role-based access validation
   */
  async getGrievanceById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;

      const grievance = await prisma.grievance.findFirst({
        where: {
          OR: [{ id }, { trackingNumber: id }],
        },
        include: {
          department: true,
          category: true,
          location: true,
          citizen: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
          attachments: true,
          aiClassification: true,
          assignments: {
            include: {
              officerProfile: {
                include: {
                  user: { select: { id: true, fullName: true, email: true } },
                },
              },
              assignedBy: { select: { id: true, fullName: true, role: true } },
            },
          },
          statusHistories: {
            include: {
              actor: { select: { id: true, fullName: true, role: true } },
            },
            orderBy: { createdAt: "asc" },
          },
          escalations: true,
          feedback: true,
        },
      });

      if (!grievance) {
        throw ApiError.notFound("Grievance not found");
      }

      // Security check: Citizens can ONLY view their own grievances
      if (user.role === "CITIZEN" && grievance.citizenId !== user.id) {
        throw ApiError.forbidden("You are not authorized to view this grievance");
      }

      ApiResponse.success(res, grievance, "Grievance details retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/grievances
   * List grievances for Officers / Admins / Citizens based on role
   */
  async getGrievances(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const { status, priority, departmentId } = req.query;

      const whereClause: any = {};

      if (status) whereClause.status = status as GrievanceStatus;
      if (priority) whereClause.priority = priority as Priority;
      if (departmentId) whereClause.departmentId = departmentId as string;

      if (user.role === "CITIZEN") {
        whereClause.citizenId = user.id;
      } else if ((user.role === "OFFICER" || user.role === "SENIOR_OFFICER") && user.departmentId) {
        whereClause.departmentId = user.departmentId;
      }

      const grievances = await prisma.grievance.findMany({
        where: whereClause,
        include: {
          department: { select: { id: true, name: true, code: true } },
          category: { select: { id: true, name: true } },
          citizen: { select: { id: true, fullName: true, email: true, phone: true } },
          location: true,
          aiClassification: true,
          attachments: true,
          statusHistories: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      ApiResponse.success(res, grievances, "Grievances retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/grievances/:id/status
   * Update grievance status with transition audit logging
   */
  async updateGrievanceStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, remarks, resolutionSummary } = req.body;
      const actorId = req.user!.id;

      const existing = await prisma.grievance.findUnique({ where: { id } });
      if (!existing) {
        throw ApiError.notFound("Grievance not found");
      }

      const updated = await prisma.grievance.update({
        where: { id },
        data: {
          status: status as GrievanceStatus,
          resolutionSummary: resolutionSummary || existing.resolutionSummary,
          resolvedAt: status === "RESOLVED" ? new Date() : existing.resolvedAt,
          statusHistories: {
            create: {
              actorId,
              actionTaken: `STATUS_CHANGED_TO_${status}`,
              previousStatus: existing.status,
              newStatus: status as GrievanceStatus,
              remarks: remarks || `Status updated to ${status}`,
            },
          },
        },
        include: {
          statusHistories: true,
        },
      });

      ApiResponse.success(res, updated, "Grievance status updated successfully");
    } catch (error) {
      next(error);
    }
  }
}

export const grievanceController = new GrievanceController();
export default grievanceController;
