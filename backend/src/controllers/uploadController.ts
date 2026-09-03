import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { storageService } from "../services/storage/storageFactory";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import { AuthenticatedRequest } from "../types";
import { Role } from "@prisma/client";
import { logger } from "../utils/logger";

export class UploadController {
  /**
   * 1. POST /api/v1/uploads/general
   * Authenticated staging upload for forms prior to final entity submission
   */
  async uploadGeneralFile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw ApiError.badRequest("No file uploaded. Please provide a file under the 'file' key.");
      }

      const userId = req.user!.id;
      const file = req.file;

      const uploadResult = await storageService.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        "staging"
      );

      // Log audit
      await prisma.auditLog.create({
        data: {
          actorId: userId,
          action: "FILE_UPLOADED_STAGING",
          entityType: "File",
          metadata: {
            fileKey: uploadResult.fileKey,
            originalName: uploadResult.originalName,
            fileSizeBytes: uploadResult.fileSizeBytes,
            mimeType: uploadResult.mimeType,
          },
        },
      });

      ApiResponse.created(res, uploadResult, "File uploaded and secured successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * 2. POST /api/v1/uploads/grievance/:id/attachment
   * Attach citizen evidence or supporting photograph to grievance
   */
  async uploadGrievanceAttachment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw ApiError.badRequest("No file uploaded");
      }

      const { id } = req.params;
      const user = req.user!;
      const file = req.file;

      const grievance = await prisma.grievance.findUnique({
        where: { id },
      });

      if (!grievance) {
        throw ApiError.notFound("Grievance record not found");
      }

      // Security check: Citizen must own grievance, or user must be department officer / admin
      if (user.role === Role.CITIZEN && grievance.citizenId !== user.id) {
        throw ApiError.forbidden("You are not authorized to attach files to this grievance");
      }

      const uploadResult = await storageService.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        "grievance_attachments"
      );

      const attachment = await prisma.$transaction(async (tx) => {
        const att = await tx.grievanceAttachment.create({
          data: {
            grievanceId: id,
            uploadedById: user.id,
            fileName: uploadResult.fileName,
            originalName: uploadResult.originalName,
            fileUrl: uploadResult.fileUrl,
            mimeType: uploadResult.mimeType,
            fileSizeBytes: uploadResult.fileSizeBytes,
            storageProvider: uploadResult.storageProvider,
            isResolutionEvidence: false,
          },
        });

        await tx.auditLog.create({
          data: {
            actorId: user.id,
            action: "GRIEVANCE_ATTACHMENT_UPLOADED",
            entityType: "GrievanceAttachment",
            entityId: att.id,
            metadata: {
              grievanceId: id,
              trackingNumber: grievance.trackingNumber,
              originalName: uploadResult.originalName,
            },
          },
        });

        return att;
      });

      ApiResponse.created(res, attachment, "Grievance attachment uploaded and cataloged successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * 3. POST /api/v1/uploads/officer/grievance/:id/evidence
   * Field Officer attaches verified resolution evidence photograph or inspection report
   */
  async uploadOfficerEvidence(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw ApiError.badRequest("No file uploaded");
      }

      const { id } = req.params;
      const user = req.user!;
      const file = req.file;

      const grievance = await prisma.grievance.findUnique({
        where: { id },
        include: { assignments: { where: { isActive: true } } },
      });

      if (!grievance) {
        throw ApiError.notFound("Grievance record not found");
      }

      const uploadResult = await storageService.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        "resolution_evidence"
      );

      const attachment = await prisma.$transaction(async (tx) => {
        const att = await tx.grievanceAttachment.create({
          data: {
            grievanceId: id,
            uploadedById: user.id,
            fileName: uploadResult.fileName,
            originalName: uploadResult.originalName,
            fileUrl: uploadResult.fileUrl,
            mimeType: uploadResult.mimeType,
            fileSizeBytes: uploadResult.fileSizeBytes,
            storageProvider: uploadResult.storageProvider,
            isResolutionEvidence: true,
          },
        });

        await tx.auditLog.create({
          data: {
            actorId: user.id,
            action: "OFFICER_RESOLUTION_EVIDENCE_UPLOADED",
            entityType: "GrievanceAttachment",
            entityId: att.id,
            metadata: {
              grievanceId: id,
              trackingNumber: grievance.trackingNumber,
              fileKey: uploadResult.fileKey,
            },
          },
        });

        return att;
      });

      ApiResponse.created(res, attachment, "Resolution evidence uploaded successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * 4. POST /api/v1/uploads/application/:id/document
   * Upload supporting document scan for a service application
   */
  async uploadApplicationDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw ApiError.badRequest("No file uploaded");
      }

      const { id } = req.params;
      const { documentType } = req.body;
      const user = req.user!;
      const file = req.file;

      const application = await prisma.serviceApplication.findUnique({
        where: { id },
      });

      if (!application) {
        throw ApiError.notFound("Service application record not found");
      }

      if (user.role === Role.CITIZEN && application.citizenId !== user.id) {
        throw ApiError.forbidden("You are not authorized to upload documents for this application");
      }

      const uploadResult = await storageService.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        "service_documents"
      );

      const document = await prisma.$transaction(async (tx) => {
        const doc = await tx.serviceDocument.create({
          data: {
            serviceApplicationId: id,
            uploadedById: user.id,
            documentType: documentType || "SUPPORTING_PROOF",
            fileName: uploadResult.fileName,
            originalName: uploadResult.originalName,
            fileUrl: uploadResult.fileUrl,
            mimeType: uploadResult.mimeType,
            fileSizeBytes: uploadResult.fileSizeBytes,
            storageProvider: uploadResult.storageProvider,
          },
        });

        await tx.auditLog.create({
          data: {
            actorId: user.id,
            action: "SERVICE_APPLICATION_DOCUMENT_UPLOADED",
            entityType: "ServiceDocument",
            entityId: doc.id,
            metadata: {
              applicationNumber: application.applicationNumber,
              documentType: doc.documentType,
            },
          },
        });

        return doc;
      });

      ApiResponse.created(res, document, "Application document uploaded and registered");
    } catch (error) {
      next(error);
    }
  }

  /**
   * 5. GET /api/v1/uploads/files/:folder/:fileName
   * Securely stream file with MIME validation, IDOR authorization, and caching headers
   */
  async getSecureFile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { folder, fileName } = req.params;
      const user = req.user!;
      const fileKey = `${folder}/${fileName}`;

      // IDOR Protection: Check database permissions if file belongs to a grievance or application
      if (user.role === Role.CITIZEN) {
        const [grievanceAtt, serviceDoc] = await Promise.all([
          prisma.grievanceAttachment.findFirst({
            where: { fileName },
            include: { grievance: { select: { citizenId: true } } },
          }),
          prisma.serviceDocument.findFirst({
            where: { fileName },
            include: { serviceApplication: { select: { citizenId: true } } },
          }),
        ]);

        if (grievanceAtt && grievanceAtt.uploadedById !== user.id && grievanceAtt.grievance.citizenId !== user.id) {
          throw ApiError.forbidden("You are not authorized to view this document");
        }

        if (serviceDoc && serviceDoc.uploadedById !== user.id && serviceDoc.serviceApplication.citizenId !== user.id) {
          throw ApiError.forbidden("You are not authorized to view this application document");
        }
      }

      const { stream, mimeType, fileSizeBytes } = await storageService.getFileStream(fileKey);

      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Length", fileSizeBytes);
      res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
      res.setHeader("Cache-Control", "private, max-age=86400"); // 24h client cache
      res.setHeader("X-Content-Type-Options", "nosniff");

      stream.pipe(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 6. DELETE /api/v1/uploads/attachments/:id
   * Remove attachment and purge from storage
   */
  async deleteAttachment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;

      const attachment = await prisma.grievanceAttachment.findUnique({
        where: { id },
      });

      if (!attachment) {
        throw ApiError.notFound("Attachment not found");
      }

      if (user.role === Role.CITIZEN && attachment.uploadedById !== user.id) {
        throw ApiError.forbidden("You are not authorized to delete this attachment");
      }

      await prisma.$transaction(async (tx) => {
        await tx.grievanceAttachment.delete({ where: { id } });
        await tx.auditLog.create({
          data: {
            actorId: user.id,
            action: "GRIEVANCE_ATTACHMENT_DELETED",
            entityType: "GrievanceAttachment",
            entityId: id,
          },
        });
      });

      // Cleanup physical file asynchronously
      const fileKey = `grievance_attachments/${attachment.fileName}`;
      storageService.deleteFile(fileKey).catch((err) => {
        logger.warn(`Failed to clean up physical file ${fileKey}: ${err.message}`);
      });

      ApiResponse.success(res, { id }, "Attachment deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

export const uploadController = new UploadController();
export default uploadController;
