import { prisma } from "../../config/database";
import { IAnomalyDetector } from "./anomaly.interface";
import { statisticalAnomalyDetector } from "./statisticalAnomalyDetector";
import { AnomalyStatus, AnomalySeverity } from "@prisma/client";
import { logger } from "../../utils/logger";
import { ApiError } from "../../utils/apiError";

export interface AnomalyFilterOptions {
  status?: AnomalyStatus | "ALL";
  severity?: AnomalySeverity | "ALL";
  departmentId?: string | "ALL";
  page?: number;
  limit?: number;
}

export class AnomalyDetectionService {
  private detector: IAnomalyDetector = statisticalAnomalyDetector;

  /**
   * Pluggable detector setter (enables future ML model integration)
   */
  setDetector(detector: IAnomalyDetector): void {
    this.detector = detector;
    logger.info(`[AnomalyDetectionService] Switched detector to: ${detector.name}`);
  }

  /**
   * Scans relational database for abnormal volume spikes across all departments and PIN codes
   */
  async runAnomalyScan(): Promise<{
    scannedClusters: number;
    anomaliesDetected: number;
    newAnomaliesSaved: number;
  }> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyFiveDaysAgo = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000);

    // 1. Fetch current window grievances (past 7 days)
    const currentWindowGrievances = await prisma.grievance.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { departmentId: true, pincode: true, department: { select: { name: true, code: true } } },
    });

    // 2. Fetch baseline history (prior 4 weeks)
    const baselineGrievances = await prisma.grievance.findMany({
      where: { createdAt: { gte: thirtyFiveDaysAgo, lt: sevenDaysAgo } },
      select: { departmentId: true, pincode: true, createdAt: true },
    });

    // 3. Cluster current window by (departmentId + pincode)
    const currentClusters: Record<
      string,
      { departmentId?: string; departmentName?: string; pincode?: string; count: number }
    > = {};

    currentWindowGrievances.forEach((g) => {
      const key = `${g.departmentId || "NONE"}_${g.pincode || "110001"}`;
      if (!currentClusters[key]) {
        currentClusters[key] = {
          departmentId: g.departmentId || undefined,
          departmentName: g.department?.name,
          pincode: g.pincode || undefined,
          count: 0,
        };
      }
      currentClusters[key].count++;
    });

    let anomaliesDetected = 0;
    let newAnomaliesSaved = 0;

    // 4. Run detection per cluster
    for (const [key, cluster] of Object.entries(currentClusters)) {
      // Aggregate historical weekly counts for this cluster
      const [deptId, pin] = key.split("_");
      const matchedBaseline = baselineGrievances.filter((b) => {
        const dMatch = deptId === "NONE" ? !b.departmentId : b.departmentId === deptId;
        const pMatch = pin === "110001" ? (!b.pincode || b.pincode === "110001") : b.pincode === pin;
        return dMatch && pMatch;
      });

      // Split into 4 weekly bucket counts
      const weeklyCounts = [0, 0, 0, 0];
      matchedBaseline.forEach((b) => {
        const daysDiff = Math.floor((sevenDaysAgo.getTime() - b.createdAt.getTime()) / (7 * 24 * 60 * 60 * 1000));
        const bucket = Math.min(3, Math.max(0, daysDiff));
        weeklyCounts[bucket]++;
      });

      // Execute detector algorithm
      const detectionResult = await this.detector.detect({
        departmentId: cluster.departmentId,
        departmentName: cluster.departmentName,
        locationPincode: cluster.pincode,
        historicalCounts: weeklyCounts,
        currentCount: cluster.count,
      });

      if (detectionResult.isAnomaly) {
        anomaliesDetected++;

        // Check if active anomaly already registered for this cluster in last 48h
        const existingOpen = await prisma.anomalyRecord.findFirst({
          where: {
            departmentId: cluster.departmentId || null,
            locationPincode: cluster.pincode || null,
            status: { in: [AnomalyStatus.OPEN, AnomalyStatus.INVESTIGATING] },
          },
        });

        if (!existingOpen) {
          await prisma.anomalyRecord.create({
            data: {
              departmentId: cluster.departmentId || null,
              locationPincode: cluster.pincode || null,
              locationArea: cluster.pincode ? `Ward PIN ${cluster.pincode}` : "Municipal Zone",
              anomalyType: detectionResult.anomalyType,
              severity: detectionResult.severity,
              status: AnomalyStatus.OPEN,
              baselineCount: detectionResult.baselineCount,
              currentCount: detectionResult.currentCount,
              percentageIncrease: detectionResult.percentageIncrease,
              zScore: detectionResult.zScore,
              description: detectionResult.explanation,
            },
          });
          newAnomaliesSaved++;
        }
      }
    }

    logger.info(
      `[AnomalyDetectionService] Scan completed: ${Object.keys(currentClusters).length} clusters evaluated, ${anomaliesDetected} anomalies detected, ${newAnomaliesSaved} new records registered.`
    );

    return {
      scannedClusters: Object.keys(currentClusters).length,
      anomaliesDetected,
      newAnomaliesSaved,
    };
  }

  /**
   * Retrieves anomaly records with filtering & pagination
   */
  async getAnomalies(options?: AnomalyFilterOptions) {
    const page = Math.max(1, options?.page || 1);
    const limit = Math.max(1, Math.min(50, options?.limit || 15));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options?.status && options.status !== "ALL") {
      where.status = options.status;
    }
    if (options?.severity && options.severity !== "ALL") {
      where.severity = options.severity;
    }
    if (options?.departmentId && options.departmentId !== "ALL") {
      where.departmentId = options.departmentId;
    }

    const [anomalies, total, openCount, criticalCount] = await Promise.all([
      prisma.anomalyRecord.findMany({
        where,
        include: { department: { select: { id: true, name: true, code: true } } },
        orderBy: [{ severity: "desc" }, { detectedAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.anomalyRecord.count({ where }),
      prisma.anomalyRecord.count({ where: { status: AnomalyStatus.OPEN } }),
      prisma.anomalyRecord.count({
        where: {
          severity: AnomalySeverity.CRITICAL,
          status: { in: [AnomalyStatus.OPEN, AnomalyStatus.INVESTIGATING] },
        },
      }),
    ]);

    return {
      anomalies,
      metrics: {
        total,
        openCount,
        criticalCount,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Updates an anomaly's investigation status with forensic audit log
   */
  async updateStatus(
    id: string,
    newStatus: AnomalyStatus,
    investigationNotes?: string,
    actorId?: string
  ) {
    const record = await prisma.anomalyRecord.findUnique({ where: { id } });
    if (!record) {
      throw ApiError.notFound("Anomaly record not found");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const rec = await tx.anomalyRecord.update({
        where: { id },
        data: {
          status: newStatus,
          investigationNotes: investigationNotes !== undefined ? investigationNotes : undefined,
          resolvedAt:
            newStatus === AnomalyStatus.RESOLVED || newStatus === AnomalyStatus.FALSE_POSITIVE
              ? new Date()
              : null,
          resolvedById:
            newStatus === AnomalyStatus.RESOLVED || newStatus === AnomalyStatus.FALSE_POSITIVE
              ? actorId
              : null,
        },
      });

      if (actorId) {
        await tx.auditLog.create({
          data: {
            actorId,
            action: `ANOMALY_STATUS_${newStatus}`,
            entityType: "AnomalyRecord",
            entityId: id,
            changes: {
              previousStatus: record.status,
              newStatus,
              investigationNotes,
            },
          },
        });
      }

      return rec;
    });

    logger.info(
      `[AnomalyDetectionService] Updated Anomaly ${id} status: ${record.status} -> ${newStatus} by Actor ${actorId || "SYSTEM"}`
    );

    return updated;
  }
}

export const anomalyDetectionService = new AnomalyDetectionService();
export default anomalyDetectionService;
