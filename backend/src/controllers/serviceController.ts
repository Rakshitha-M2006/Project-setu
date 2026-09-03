import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import { AuthenticatedRequest } from "../types";
import { ApplicationStatus, NotificationType, StorageProvider } from "@prisma/client";

// Input Validation Schemas
export const submitServiceApplicationSchema = z.object({
  body: z.object({
    formData: z.record(z.any()).refine((data) => Object.keys(data).length > 0, {
      message: "Application form data is required",
    }),
    isDraft: z.boolean().optional().default(false),
    documents: z
      .array(
        z.object({
          documentType: z.string().min(2, "Document type is required"),
          fileName: z.string().min(1),
          originalName: z.string().min(1),
          fileUrl: z.string().url("Must be a valid document URL"),
          mimeType: z.string(),
          fileSizeBytes: z.number().int().nonnegative(),
        })
      )
      .optional()
      .default([]),
  }),
  params: z.object({
    serviceId: z.string(),
  }),
});

export const updateApplicationStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      "DRAFT",
      "SUBMITTED",
      "DOCUMENT_VERIFICATION",
      "UNDER_REVIEW",
      "APPROVED",
      "REJECTED",
      "COMPLETED",
    ]),
    officerRemarks: z.string().max(2000).optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export class ServiceController {
  /**
   * GET /api/v1/services
   * List all active government services with search and department filtering
   */
  async getServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { departmentId, search } = req.query;

      const whereClause: any = { isActive: true };

      if (departmentId && departmentId !== "ALL") {
        whereClause.departmentId = departmentId as string;
      }

      if (search && typeof search === "string" && search.trim()) {
        const q = search.trim();
        whereClause.OR = [
          { name: { contains: q } },
          { code: { contains: q } },
          { description: { contains: q } },
          { department: { name: { contains: q } } },
        ];
      }

      const services = await prisma.governmentService.findMany({
        where: whereClause,
        include: {
          department: {
            select: { id: true, name: true, code: true },
          },
        },
        orderBy: { name: "asc" },
      });

      ApiResponse.success(res, services, "Government services catalog retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/services/:id
   * Get complete details, eligibility, and required documents for a specific service
   */
  async getServiceById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const service = await prisma.governmentService.findFirst({
        where: {
          OR: [{ id }, { code: id }],
        },
        include: {
          department: true,
        },
      });

      if (!service) {
        throw ApiError.notFound("Government service not found in official catalog");
      }

      ApiResponse.success(res, service, "Service details retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/services/:serviceId/apply
   * Submit an application for a government service with documents and form payload
   */
  async applyForService(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const citizenId = req.user!.id;
      const { serviceId } = req.params;
      const { formData, isDraft, documents } = req.body;

      const service = await prisma.governmentService.findUnique({
        where: { id: serviceId },
        include: { department: true },
      });

      if (!service) {
        throw ApiError.notFound("Government service not found");
      }

      if (!service.isActive) {
        throw ApiError.badRequest("This government service is currently inactive");
      }

      // Generate human-readable reference token (e.g. SETU-SRV-2026-104928)
      const currentYear = new Date().getFullYear();
      const randomSeq = String(Math.floor(100000 + Math.random() * 900000));
      const applicationNumber = `SETU-SRV-${currentYear}-${randomSeq}`;

      const initialStatus = isDraft ? ApplicationStatus.DRAFT : ApplicationStatus.SUBMITTED;

      const application = await prisma.$transaction(async (tx) => {
        const createdApp = await tx.serviceApplication.create({
          data: {
            applicationNumber,
            citizenId,
            serviceId: service.id,
            departmentId: service.departmentId,
            status: initialStatus,
            formData: formData || {},
            documents: documents && documents.length > 0
              ? {
                  create: documents.map((doc: any) => ({
                    uploadedById: citizenId,
                    documentType: doc.documentType,
                    fileName: doc.fileName,
                    originalName: doc.originalName,
                    fileUrl: doc.fileUrl,
                    mimeType: doc.mimeType,
                    fileSizeBytes: doc.fileSizeBytes || 0,
                    storageProvider: StorageProvider.LOCAL,
                  })),
                }
              : undefined,
          },
          include: {
            service: true,
            department: true,
            documents: true,
          },
        });

        // Add Audit Log
        await tx.auditLog.create({
          data: {
            actorId: citizenId,
            action: isDraft ? "SERVICE_APPLICATION_DRAFT_SAVED" : "SERVICE_APPLICATION_SUBMITTED",
            entityType: "ServiceApplication",
            entityId: createdApp.id,
            metadata: {
              applicationNumber,
              serviceName: service.name,
              departmentCode: service.department.code,
            },
          },
        });

        // Notify Citizen if submitted
        if (!isDraft) {
          await tx.notification.create({
            data: {
              recipientId: citizenId,
              type: NotificationType.SERVICE_APPLICATION_UPDATE,
              title: `Application Registered: ${applicationNumber}`,
              message: `Your application for '${service.name}' has been successfully submitted under reference ${applicationNumber}. Estimated processing: ${service.estimatedProcessingDays} working days.`,
              linkUrl: `/citizen/applications/${createdApp.id}`,
            },
          });
        }

        return createdApp;
      });

      ApiResponse.created(
        res,
        {
          application,
          applicationNumber: application.applicationNumber,
          serviceName: service.name,
          departmentName: service.department.name,
          estimatedDays: service.estimatedProcessingDays,
        },
        isDraft ? "Draft application saved successfully" : "Service application submitted successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/services/my/applications
   * Get all service applications submitted by the logged-in citizen
   */
  async getMyApplications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const citizenId = req.user!.id;
      const { status } = req.query;

      const whereClause: any = { citizenId };

      if (status && status !== "ALL") {
        whereClause.status = status as ApplicationStatus;
      }

      const applications = await prisma.serviceApplication.findMany({
        where: whereClause,
        include: {
          service: true,
          department: { select: { id: true, name: true, code: true } },
          reviewingOfficer: { select: { id: true, fullName: true, email: true } },
          documents: true,
          feedbacks: true,
        },
        orderBy: { createdAt: "desc" },
      });

      ApiResponse.success(res, applications, "Citizen service applications retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/services/applications/:id
   * Get complete details and audit status of an application
   */
  async getApplicationById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;

      const application = await prisma.serviceApplication.findFirst({
        where: {
          OR: [{ id }, { applicationNumber: id }],
        },
        include: {
          service: true,
          department: true,
          citizen: { select: { id: true, fullName: true, email: true, phone: true } },
          reviewingOfficer: { select: { id: true, fullName: true, email: true } },
          documents: true,
          feedbacks: true,
        },
      });

      if (!application) {
        throw ApiError.notFound("Service application not found in official registry");
      }

      // Security: Citizens can only inspect their own applications
      if (user.role === "CITIZEN" && application.citizenId !== user.id) {
        throw ApiError.forbidden("You are not authorized to view this service application");
      }

      ApiResponse.success(res, application, "Application details retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/services/applications/:id/status
   * Reviewing Officer updates application lifecycle state
   */
  async updateApplicationStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, officerRemarks } = req.body;
      const officerId = req.user!.id;

      const application = await prisma.serviceApplication.findUnique({
        where: { id },
        include: { service: true, department: true },
      });

      if (!application) {
        throw ApiError.notFound("Service application not found");
      }

      const isFinal = status === ApplicationStatus.APPROVED || status === ApplicationStatus.REJECTED || status === ApplicationStatus.COMPLETED;

      const updated = await prisma.$transaction(async (tx) => {
        const app = await tx.serviceApplication.update({
          where: { id },
          data: {
            status: status as ApplicationStatus,
            reviewingOfficerId: officerId,
            officerRemarks: officerRemarks || application.officerRemarks,
            reviewedAt: new Date(),
            completedAt: isFinal ? new Date() : application.completedAt,
          },
          include: {
            service: true,
            department: true,
            documents: true,
          },
        });

        // Audit Log
        await tx.auditLog.create({
          data: {
            actorId: officerId,
            action: `SERVICE_APPLICATION_STATUS_${status}`,
            entityType: "ServiceApplication",
            entityId: id,
            changes: { previousStatus: application.status, newStatus: status, officerRemarks },
          },
        });

        // Notify Citizen
        await tx.notification.create({
          data: {
            recipientId: application.citizenId,
            type: NotificationType.SERVICE_APPLICATION_UPDATE,
            title: `Application Update: ${application.applicationNumber}`,
            message: `Your application for '${application.service.name}' status has changed to ${status.replace(/_/g, " ")}. Remarks: ${officerRemarks || "Status reviewed by department."}`,
            linkUrl: `/citizen/applications/${id}`,
          },
        });

        return app;
      });

      ApiResponse.success(res, updated, `Application status updated to ${status}`);
    } catch (error) {
      next(error);
    }
  }
}

export const serviceController = new ServiceController();
export default serviceController;
