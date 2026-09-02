import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../config/db";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import { AiServiceClient } from "../services/aiServiceClient";
import { Priority, GrievanceStatus } from "@prisma/client";

export const createGrievanceSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(5, "Description must be at least 5 characters"),
    location: z.string().optional(),
    pincode: z.string().optional(),
    departmentId: z.string().optional(),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      "SUBMITTED",
      "AI_TRIAGED",
      "ASSIGNED",
      "IN_PROGRESS",
      "RESOLVED",
      "REJECTED",
      "ESCALATED",
    ]),
    remarks: z.string().optional(),
    resolutionNote: z.string().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export const submitGrievance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const citizenId = req.user!.id;
    const { title, description, location, pincode, departmentId } = req.body;

    // 1. Call AI Microservice for NLP triage & SLA estimate
    const aiAnalysis = await AiServiceClient.analyzeGrievance(title, description, location, pincode);

    // 2. Resolve department from AI recommendation if not explicitly passed
    let targetDepartmentId = departmentId;
    if (!targetDepartmentId && aiAnalysis?.suggested_department) {
      const matchedDept = await prisma.department.findUnique({
        where: { code: aiAnalysis.suggested_department },
      });
      if (matchedDept) {
        targetDepartmentId = matchedDept.id;
      }
    }

    // 3. Compute SLA Deadline
    const slaHours = aiAnalysis?.estimated_sla_hours || 48;
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    // 4. Generate unique tracking number (e.g. SETU-2026-XXXXX)
    const trackingNumber = `SETU-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const priorityValue = (aiAnalysis?.priority as Priority) || Priority.MEDIUM;

    // 5. Persist to MySQL Database with initial timeline
    const grievance = await prisma.grievance.create({
      data: {
        trackingNumber,
        citizenId,
        departmentId: targetDepartmentId,
        title,
        description,
        location,
        pincode,
        status: GrievanceStatus.AI_TRIAGED,
        priority: priorityValue,
        aiConfidenceScore: aiAnalysis?.confidence_score,
        aiKeywords: aiAnalysis?.extracted_keywords || [],
        slaDeadline,
        timelines: {
          create: {
            actorId: citizenId,
            action: "GRIEVANCE_SUBMITTED",
            previousStatus: null,
            newStatus: GrievanceStatus.SUBMITTED,
            remarks: "Grievance submitted by citizen and automatically triaged by AI engine.",
          },
        },
      },
      include: {
        department: true,
        timelines: true,
      },
    });

    return ApiResponse.created(
      res,
      { grievance, aiAnalysis },
      "Grievance submitted and triaged successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getGrievances = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { status, priority } = req.query;

    const whereClause: any = {};

    if (status) {
      whereClause.status = status as GrievanceStatus;
    }
    if (priority) {
      whereClause.priority = priority as Priority;
    }

    // Role-based visibility
    if (user.role === "CITIZEN") {
      whereClause.citizenId = user.id;
    } else if (user.role === "OFFICER" || user.role === "SENIOR_OFFICER") {
      if (user.departmentId) {
        whereClause.departmentId = user.departmentId;
      }
    }

    const grievances = await prisma.grievance.findMany({
      where: whereClause,
      include: {
        department: { select: { id: true, name: true, code: true } },
        citizen: { select: { id: true, fullName: true, email: true, phone: true } },
        assignedOfficer: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return ApiResponse.success(res, grievances, "Grievances retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const getGrievanceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const grievance = await prisma.grievance.findUnique({
      where: { id },
      include: {
        department: true,
        category: true,
        citizen: { select: { id: true, fullName: true, email: true, phone: true } },
        assignedOfficer: { select: { id: true, fullName: true, email: true } },
        timelines: {
          include: {
            actor: { select: { id: true, fullName: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        documents: true,
        feedback: true,
      },
    });

    if (!grievance) {
      throw ApiError.notFound("Grievance not found");
    }

    // Citizen authorization check
    if (user.role === "CITIZEN" && grievance.citizenId !== user.id) {
      throw ApiError.forbidden("You are not authorized to view this grievance");
    }

    return ApiResponse.success(res, grievance, "Grievance details retrieved");
  } catch (error) {
    next(error);
  }
};

export const updateGrievanceStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, remarks, resolutionNote } = req.body;
    const actorId = req.user!.id;

    const existing = await prisma.grievance.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound("Grievance not found");
    }

    const updated = await prisma.grievance.update({
      where: { id },
      data: {
        status: status as GrievanceStatus,
        resolutionNote: resolutionNote || existing.resolutionNote,
        resolvedAt: status === "RESOLVED" ? new Date() : existing.resolvedAt,
        timelines: {
          create: {
            actorId,
            action: `STATUS_CHANGED_TO_${status}`,
            previousStatus: existing.status,
            newStatus: status,
            remarks: remarks || `Status updated to ${status}`,
          },
        },
      },
      include: {
        timelines: true,
      },
    });

    return ApiResponse.success(res, updated, "Grievance status updated successfully");
  } catch (error) {
    next(error);
  }
};
