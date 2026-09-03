import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import { AuthenticatedRequest } from "../types";
import { ApplicationStatus } from "@prisma/client";

export class ServiceController {
  /**
   * GET /api/v1/services
   * List all available government services
   */
  async getServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const services = await prisma.governmentService.findMany({
        where: { isActive: true },
        include: {
          department: {
            select: { id: true, name: true, code: true },
          },
        },
        orderBy: { name: "asc" },
      });

      ApiResponse.success(res, services, "Government services retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/services/:serviceId/apply
   * Submit an application for a government service
   */
  async applyForService(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const citizenId = req.user!.id;
      const { serviceId } = req.params;
      const { formData } = req.body;

      const service = await prisma.governmentService.findUnique({
        where: { id: serviceId },
      });

      if (!service) {
        throw ApiError.notFound("Government service not found");
      }

      // Generate Application tracking number (e.g. APP-2026-XXXXX)
      const applicationNumber = `APP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      const application = await prisma.serviceApplication.create({
        data: {
          applicationNumber,
          citizenId,
          serviceId: service.id,
          departmentId: service.departmentId,
          status: ApplicationStatus.SUBMITTED,
          formData: formData || {},
        },
        include: {
          service: true,
          department: true,
        },
      });

      ApiResponse.created(res, application, "Service application submitted successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/services/my-applications
   * Get all service applications submitted by current citizen
   */
  async getMyApplications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const citizenId = req.user!.id;

      const applications = await prisma.serviceApplication.findMany({
        where: { citizenId },
        include: {
          service: true,
          department: { select: { id: true, name: true, code: true } },
          reviewingOfficer: { select: { id: true, fullName: true, email: true } },
          documents: true,
        },
        orderBy: { createdAt: "desc" },
      });

      ApiResponse.success(res, applications, "My service applications retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
}

export const serviceController = new ServiceController();
export default serviceController;
