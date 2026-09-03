import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../../config/database";
import { SlaService } from "../../services/slaService";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";
import { requireAuth, requireAnyRole } from "../../middleware/authMiddleware";
import validateRequest from "../../middleware/validate";
import { Role } from "@prisma/client";

const router = Router();

const escalateSchema = z.object({
  body: z.object({
    reason: z.string().min(5, "Escalation reason must be at least 5 characters").max(1000),
  }),
  params: z.object({
    id: z.string(),
  }),
});

/**
 * GET /api/v1/sla/grievances/:id/status
 * Real-time SLA progress calculation, remaining turnaround hours, and citizen-friendly status
 */
router.get(
  "/grievances/:id/status",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const grievance = await prisma.grievance.findFirst({
        where: {
          OR: [{ id }, { trackingNumber: id }],
        },
        include: {
          escalations: {
            orderBy: { triggeredAt: "desc" },
          },
        },
      });

      if (!grievance) {
        throw ApiError.notFound("Grievance not found");
      }

      const slaStatus = SlaService.getGrievanceSlaStatus(grievance as any);

      ApiResponse.success(res, slaStatus, "Grievance SLA status calculated successfully");
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/sla/grievances/:id/escalate
 * Trigger manual escalation for prolonged delay
 */
router.post(
  "/grievances/:id/escalate",
  requireAuth,
  validateRequest(escalateSchema),
  async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const actorId = req.user.id;

      const result = await SlaService.triggerManualEscalation(id, actorId, reason);

      ApiResponse.success(res, result, "Grievance has been escalated to senior supervisor for immediate review");
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/sla/check-overdue
 * Batch job endpoint to detect breached complaints and advance tiered escalations
 */
router.post(
  "/check-overdue",
  requireAuth,
  requireAnyRole(Role.ADMIN, Role.SENIOR_OFFICER),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await SlaService.detectAndProcessOverdueGrievances();
      ApiResponse.success(res, result, "SLA breach check and automated escalation batch job executed");
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/sla/overdue-summary
 * Overdue analytics summary for department supervisors and administrators
 */
router.get(
  "/overdue-summary",
  requireAuth,
  requireAnyRole(Role.OFFICER, Role.SENIOR_OFFICER, Role.ADMIN),
  async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      const now = new Date();

      const whereClause: any = {
        slaDeadline: { lt: now },
        status: { not: "RESOLVED" },
      };

      if (user.role === "OFFICER" || user.role === "SENIOR_OFFICER") {
        if (user.departmentId) {
          whereClause.departmentId = user.departmentId;
        }
      }

      const overdueCount = await prisma.grievance.count({ where: whereClause });
      const escalatedCount = await prisma.grievance.count({
        where: { ...whereClause, isEscalated: true },
      });

      const topBreaches = await prisma.grievance.findMany({
        where: whereClause,
        include: {
          department: { select: { name: true, code: true } },
          category: { select: { name: true } },
          assignments: {
            where: { isActive: true },
            include: { officerProfile: { include: { user: { select: { fullName: true } } } } },
          },
        },
        orderBy: { slaDeadline: "asc" },
        take: 10,
      });

      ApiResponse.success(
        res,
        {
          overdueCount,
          escalatedCount,
          topBreaches,
        },
        "SLA overdue summary analytics retrieved"
      );
    } catch (error) {
      next(error);
    }
  }
);

export default router;
