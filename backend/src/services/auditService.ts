import { prisma } from "../config/database";
import { Request } from "express";
import { logger } from "../utils/logger";

export interface LogActionParams {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  req?: Request;
  changes?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
}

export interface AuditFilterParams {
  search?: string;
  actorId?: string;
  action?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export class AuditService {
  /**
   * Sanitizes object to remove passwords, tokens, API keys, and sensitive secrets
   */
  private sanitizeData(obj: any): any {
    if (!obj || typeof obj !== "object") return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeData(item));
    }

    const sanitized: Record<string, any> = {};
    const sensitiveKeys = [
      "password",
      "passwordhash",
      "token",
      "refreshtoken",
      "accesstoken",
      "secret",
      "authorization",
      "creditcard",
      "cvv",
      "pin",
    ];

    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some((s) => lowerKey.includes(s))) {
        sanitized[key] = "[REDACTED_SECURE]";
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = this.sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Appends an immutable audit record to the database
   */
  async logAction(params: LogActionParams): Promise<void> {
    try {
      const { actorId, action, entityType, entityId, req, changes, metadata } = params;

      let ipAddress: string | null = null;
      let userAgent: string | null = null;

      if (req) {
        ipAddress =
          (req.headers["x-forwarded-for"] as string) ||
          req.socket.remoteAddress ||
          req.ip ||
          null;
        userAgent = (req.headers["user-agent"] as string) || null;
      }

      const cleanChanges = changes ? this.sanitizeData(changes) : undefined;
      const cleanMetadata = metadata ? this.sanitizeData(metadata) : undefined;

      await prisma.auditLog.create({
        data: {
          actorId: actorId || null,
          action,
          entityType,
          entityId: entityId || null,
          ipAddress: ipAddress ? String(ipAddress).slice(0, 100) : null,
          userAgent: userAgent ? String(userAgent).slice(0, 255) : null,
          changes: cleanChanges || undefined,
          metadata: cleanMetadata || undefined,
        },
      });

      logger.info(
        `[AUDIT_LOG] ${action} on ${entityType}${entityId ? ` (${entityId})` : ""} by Actor: ${actorId || "ANONYMOUS/SYSTEM"}`
      );
    } catch (error: any) {
      // Never crash the primary request if audit recording fails; log error for diagnosis
      logger.error(`[AuditService] Failed to record audit log: ${error.message}`);
    }
  }

  /**
   * Retrieves paginated audit logs with multi-faceted search & filtering
   */
  async getAuditLogs(filters?: AuditFilterParams) {
    const page = Math.max(1, filters?.page || 1);
    const limit = Math.max(1, Math.min(100, filters?.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.actorId && filters.actorId !== "ALL") {
      where.actorId = filters.actorId;
    }

    if (filters?.action && filters.action !== "ALL") {
      where.action = filters.action;
    }

    if (filters?.entityType && filters.entityType !== "ALL") {
      where.entityType = filters.entityType;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    if (filters?.search && filters.search.trim() !== "") {
      const q = filters.search.trim();
      where.OR = [
        { action: { contains: q, mode: "insensitive" } },
        { entityType: { contains: q, mode: "insensitive" } },
        { entityId: { contains: q, mode: "insensitive" } },
        { ipAddress: { contains: q, mode: "insensitive" } },
        { actor: { email: { contains: q, mode: "insensitive" } } },
        { actor: { fullName: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const auditService = new AuditService();
export default auditService;
