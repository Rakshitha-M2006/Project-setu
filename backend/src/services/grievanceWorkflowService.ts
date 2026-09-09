import { prisma } from "../config/database";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { AiServiceClient } from "./aiServiceClient";
import { GrievanceAIAnalysisResult } from "../types";
import { Priority, GrievanceStatus } from "@prisma/client";

export interface RoutingDecision {
  canAutoRoute: boolean;
  departmentId: string | null;
  departmentCode: string;
  departmentName: string;
  categoryId: string | null;
  categoryName: string | null;
  targetStatus: GrievanceStatus;
  requiresHumanReview: boolean;
  routingReason: string;
}

export interface PriorityAndSlaResult {
  priority: Priority;
  slaHours: number;
  slaDeadline: Date;
  isUrgent: boolean;
}

export class GrievanceWorkflowService {
  /**
   * 1. classifyGrievance()
   * Dispatches grievance text to the AI Microservice for NLP triage
   */
  static async classifyGrievance(
    title: string,
    description: string,
    location?: string,
    pincode?: string
  ): Promise<GrievanceAIAnalysisResult> {
    logger.info(`[Workflow] Classifying grievance: "${title.slice(0, 60)}"`);
    return await AiServiceClient.analyzeGrievance(title, description, location, pincode);
  }

  /**
   * 2. routeGrievance()
   * Evaluates AI prediction confidence against the configured threshold.
   * If confidence >= threshold: Automatically assigns department and marks for officer assignment.
   * If confidence < threshold: Marks grievance as AI_REVIEW_REQUIRED / NEEDS_REVIEW for human review.
   */
  static async routeGrievance(
    aiResult: GrievanceAIAnalysisResult,
    manualDeptId?: string | null,
    manualCatId?: string | null
  ): Promise<RoutingDecision> {
    const threshold = env.AI_CONFIDENCE_THRESHOLD;
    const confidence = aiResult.confidence_score;
    const isConfidenceHigh = confidence >= threshold && !aiResult.requires_human_review;

    // A. If citizen manually selected a department / category
    if (manualDeptId) {
      let deptName = "Specified Department";
      let deptCode = "GEN";

      try {
        const dept = await prisma.department.findUnique({
          where: { id: manualDeptId },
        });
        if (dept) {
          deptName = dept.name;
          deptCode = dept.code;
        }
      } catch (err: any) {
        logger.warn(`[Workflow] Department lookup error: ${err.message}`);
      }

      let catName: string | null = null;
      if (manualCatId) {
        try {
          const cat = await prisma.grievanceCategory.findUnique({ where: { id: manualCatId } });
          catName = cat?.name || null;
        } catch {
          // Ignore
        }
      }

      return {
        canAutoRoute: true,
        departmentId: manualDeptId,
        departmentCode: deptCode,
        departmentName: deptName,
        categoryId: manualCatId || null,
        categoryName: catName,
        targetStatus: GrievanceStatus.OFFICER_PENDING,
        requiresHumanReview: false,
        routingReason: `Citizen explicitly directed to ${deptName}.`,
      };
    }

    // B. If citizen selected a category only
    if (manualCatId && !manualDeptId) {
      try {
        const cat = await prisma.grievanceCategory.findUnique({
          where: { id: manualCatId },
          include: { department: true },
        });

        if (cat) {
          return {
            canAutoRoute: true,
            departmentId: cat.departmentId,
            departmentCode: cat.department.code,
            departmentName: cat.department.name,
            categoryId: cat.id,
            categoryName: cat.name,
            targetStatus: GrievanceStatus.OFFICER_PENDING,
            requiresHumanReview: false,
            routingReason: `Derived from citizen selected category: ${cat.name}.`,
          };
        }
      } catch (err: any) {
        logger.warn(`[Workflow] Category lookup error: ${err.message}`);
      }
    }

    // C. AI Automatic Department Routing (Confidence >= Threshold)
    if (isConfidenceHigh && aiResult.department_code) {
      let matchedDeptId: string | null = null;
      let matchedDeptName = aiResult.department || "Designated Department";
      let matchedDeptCode = aiResult.department_code;
      let matchedCatId: string | null = null;
      let matchedCatName: string | null = null;

      try {
        const matchedDept = await prisma.department.findFirst({
          where: {
            OR: [
              { code: aiResult.department_code },
              { code: { contains: aiResult.department_code } },
              { name: { contains: aiResult.department } },
            ],
          },
          include: {
            categories: {
              where: { isActive: true },
            },
          },
        });

        if (matchedDept) {
          matchedDeptId = matchedDept.id;
          matchedDeptName = matchedDept.name;
          matchedDeptCode = matchedDept.code;

          if (matchedDept.categories && matchedDept.categories.length > 0) {
            const cat = matchedDept.categories.find(
              (c) =>
                c.name.toLowerCase().includes(aiResult.issue_type.toLowerCase()) ||
                aiResult.category.toLowerCase().includes(c.name.toLowerCase())
            );
            if (cat) {
              matchedCatId = cat.id;
              matchedCatName = cat.name;
            } else {
              matchedCatId = matchedDept.categories[0].id;
              matchedCatName = matchedDept.categories[0].name;
            }
          }
        }
      } catch (err: any) {
        logger.warn(`[Workflow] Database lookup skipped/unavailable (${err.message}). Using AI predicted department directly.`);
      }

      return {
        canAutoRoute: true,
        departmentId: matchedDeptId,
        departmentCode: matchedDeptCode,
        departmentName: matchedDeptName,
        categoryId: matchedCatId,
        categoryName: matchedCatName,
        targetStatus: GrievanceStatus.OFFICER_PENDING,
        requiresHumanReview: false,
        routingReason: `AI Confidence (${(confidence * 100).toFixed(1)}% >= ${(threshold * 100).toFixed(0)}% threshold) authorized automatic routing to ${matchedDeptName}.`,
      };
    }

    // D. Confidence < Threshold -> Supervisory Triage under General Administration
    logger.info(
      `[Workflow] Low confidence (${(confidence * 100).toFixed(1)}% < ${(threshold * 100).toFixed(0)}%). Routing to General Administration for human triage.`
    );

    let genAdminDeptId: string | null = null;
    try {
      const genDept = await prisma.department.findFirst({
        where: { code: "GENERAL_ADMINISTRATION" },
      });
      if (genDept) {
        genAdminDeptId = genDept.id;
      }
    } catch {
      // Ignore database lookup error
    }

    return {
      canAutoRoute: false,
      departmentId: genAdminDeptId,
      departmentCode: "GENERAL_ADMINISTRATION",
      departmentName: "General Administration & Citizen Grievance Cell",
      categoryId: null,
      categoryName: null,
      targetStatus: GrievanceStatus.OFFICER_PENDING,
      requiresHumanReview: true,
      routingReason: `AI confidence (${(confidence * 100).toFixed(1)}%) is below ${(threshold * 100).toFixed(0)}% threshold. Routed to General Administration for officer triage.`,
    };
  }

  /**
   * 3. calculatePriority()
   * Determines the final Priority enum, calculates SLA turnaround hours and deadline
   */
  static calculatePriority(
    aiResult: GrievanceAIAnalysisResult,
    categoryDefaultPriority?: Priority
  ): PriorityAndSlaResult {
    let finalPriority: Priority = Priority.MEDIUM;

    if (aiResult.priority && Object.values(Priority).includes(aiResult.priority as any)) {
      finalPriority = aiResult.priority as Priority;
    } else if (categoryDefaultPriority) {
      finalPriority = categoryDefaultPriority;
    }

    const slaHours = aiResult.estimated_sla_hours || 48;
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    return {
      priority: finalPriority,
      slaHours,
      slaDeadline,
      isUrgent: Boolean(aiResult.is_urgent),
    };
  }

  /**
   * 4. createAssignment() / recordWorkflowLifecycle()
   * Records the complete status lifecycle in GrievanceStatusHistory:
   * SUBMITTED -> AI_CLASSIFIED -> DEPARTMENT_ASSIGNED -> OFFICER_PENDING
   * OR
   * SUBMITTED -> AI_REVIEW_REQUIRED
   */
  static getLifecycleHistoryEntries(
    citizenId: string,
    routing: RoutingDecision,
    aiResult: GrievanceAIAnalysisResult,
    priorityResult: PriorityAndSlaResult
  ): Array<{
    actorId: string | null;
    actionTaken: string;
    previousStatus: GrievanceStatus | null;
    newStatus: GrievanceStatus;
    remarks: string;
  }> {
    const history: Array<{
      actorId: string | null;
      actionTaken: string;
      previousStatus: GrievanceStatus | null;
      newStatus: GrievanceStatus;
      remarks: string;
    }> = [];

    // Step 1: Initial Submission
    history.push({
      actorId: citizenId,
      actionTaken: "GRIEVANCE_SUBMITTED",
      previousStatus: null,
      newStatus: GrievanceStatus.SUBMITTED,
      remarks: "Grievance registered in portal by citizen.",
    });

    if (routing.canAutoRoute) {
      // Step 2: AI Classification Completed
      history.push({
        actorId: null,
        actionTaken: "AI_CLASSIFICATION_COMPLETED",
        previousStatus: GrievanceStatus.SUBMITTED,
        newStatus: GrievanceStatus.AI_CLASSIFIED,
        remarks: `AI NLP analysis completed. Identified issue: '${aiResult.issue_type}' with ${(aiResult.confidence_score * 100).toFixed(1)}% confidence score.`,
      });

      // Step 3: Automatic Department Routing
      history.push({
        actorId: null,
        actionTaken: "DEPARTMENT_AUTOMATICALLY_ROUTED",
        previousStatus: GrievanceStatus.AI_CLASSIFIED,
        newStatus: GrievanceStatus.DEPARTMENT_ASSIGNED,
        remarks: `Department automatically assigned: '${routing.departmentName}' (Confidence: ${(aiResult.confidence_score * 100).toFixed(1)}% >= ${(env.AI_CONFIDENCE_THRESHOLD * 100).toFixed(0)}%).`,
      });

      // Step 4: Queued for Jurisdictional Officer Assignment
      history.push({
        actorId: null,
        actionTaken: "OFFICER_ASSIGNMENT_PENDING",
        previousStatus: GrievanceStatus.DEPARTMENT_ASSIGNED,
        newStatus: GrievanceStatus.OFFICER_PENDING,
        remarks: `Complaint queued in ${routing.departmentName} dispatch backlog. Priority set to ${priorityResult.priority} (Target SLA: ${priorityResult.slaHours} hours).`,
      });
    } else {
      // Human Review Required Flow
      history.push({
        actorId: null,
        actionTaken: "AI_CONFIDENCE_LOW_MANUAL_REVIEW_REQUIRED",
        previousStatus: GrievanceStatus.SUBMITTED,
        newStatus: GrievanceStatus.AI_REVIEW_REQUIRED,
        remarks: `AI confidence (${(aiResult.confidence_score * 100).toFixed(1)}%) is below the ${(env.AI_CONFIDENCE_THRESHOLD * 100).toFixed(0)}% auto-routing threshold. Forwarded to Nodal Grievance Officer for manual verification and department dispatch.`,
      });
    }

    return history;
  }
}

export default GrievanceWorkflowService;
