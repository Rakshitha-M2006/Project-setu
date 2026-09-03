import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import { AuthenticatedRequest } from "../types";
import { GrievanceStatus, ApplicationStatus } from "@prisma/client";

export class CitizenController {
  /**
   * GET /api/v1/citizen/dashboard-stats
   * Real-time metrics computed directly from MySQL database for the authenticated citizen
   */
  async getDashboardStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const citizenId = req.user!.id;

      // Parallel queries for real metrics
      const [
        totalGrievances,
        pendingGrievances,
        inProgressGrievances,
        resolvedGrievances,
        activeApplications,
        recentGrievances,
        notifications,
      ] = await Promise.all([
        // 1. Total Grievances
        prisma.grievance.count({
          where: { citizenId },
        }),
        // 2. Pending Grievances (Submitted or AI Triaged)
        prisma.grievance.count({
          where: {
            citizenId,
            status: { in: [GrievanceStatus.SUBMITTED, GrievanceStatus.AI_TRIAGED] },
          },
        }),
        // 3. In Progress Grievances (Assigned, In Progress, Under Inspection, Escalated, Reopened)
        prisma.grievance.count({
          where: {
            citizenId,
            status: {
              in: [
                GrievanceStatus.ASSIGNED,
                GrievanceStatus.IN_PROGRESS,
                GrievanceStatus.UNDER_INSPECTION,
                GrievanceStatus.ESCALATED,
                GrievanceStatus.REOPENED,
              ],
            },
          },
        }),
        // 4. Resolved Grievances
        prisma.grievance.count({
          where: {
            citizenId,
            status: GrievanceStatus.RESOLVED,
          },
        }),
        // 5. Active Service Applications (Not Completed / Rejected)
        prisma.serviceApplication.count({
          where: {
            citizenId,
            status: {
              in: [
                ApplicationStatus.SUBMITTED,
                ApplicationStatus.UNDER_REVIEW,
                ApplicationStatus.DOCUMENT_VERIFICATION,
                ApplicationStatus.APPROVED,
              ],
            },
          },
        }),
        // 6. 5 Most Recent Grievances
        prisma.grievance.findMany({
          where: { citizenId },
          include: {
            department: { select: { id: true, name: true, code: true } },
            category: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        // 7. Recent Notifications
        prisma.notification.findMany({
          where: { recipientId: citizenId },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
      ]);

      const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

      ApiResponse.success(
        res,
        {
          metrics: {
            totalGrievances,
            pendingGrievances,
            inProgressGrievances,
            resolvedGrievances,
            activeApplications,
            unreadNotificationsCount,
          },
          recentGrievances,
          recentNotifications: notifications,
        },
        "Citizen dashboard statistics retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/citizen/profile
   * Returns current citizen's complete profile
   */
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const citizenId = req.user!.id;

      const user = await prisma.user.findUnique({
        where: { id: citizenId },
        include: {
          citizenProfile: {
            include: {
              location: true,
            },
          },
        },
      });

      if (!user) {
        throw ApiError.notFound("Citizen user profile not found");
      }

      const { passwordHash, ...sanitized } = user;
      ApiResponse.success(res, sanitized, "Citizen profile retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/citizen/profile
   * Update citizen contact and profile details
   */
  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const citizenId = req.user!.id;
      const {
        fullName,
        phone,
        gender,
        dateOfBirth,
        addressLine1,
        addressLine2,
        pincode,
        occupation,
        emergencyContact,
      } = req.body;

      // Update User table details
      const updatedUser = await prisma.user.update({
        where: { id: citizenId },
        data: {
          fullName: fullName ? fullName.trim() : undefined,
          phone: phone ? phone.trim() : undefined,
          citizenProfile: {
            upsert: {
              create: {
                gender: gender || null,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                addressLine1: addressLine1 || null,
                addressLine2: addressLine2 || null,
                pincode: pincode || null,
                occupation: occupation || null,
                emergencyContact: emergencyContact || null,
              },
              update: {
                gender: gender !== undefined ? gender : undefined,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                addressLine1: addressLine1 !== undefined ? addressLine1 : undefined,
                addressLine2: addressLine2 !== undefined ? addressLine2 : undefined,
                pincode: pincode !== undefined ? pincode : undefined,
                occupation: occupation !== undefined ? occupation : undefined,
                emergencyContact: emergencyContact !== undefined ? emergencyContact : undefined,
              },
            },
          },
        },
        include: {
          citizenProfile: {
            include: {
              location: true,
            },
          },
        },
      });

      const { passwordHash, ...sanitized } = updatedUser;
      ApiResponse.success(res, sanitized, "Profile updated successfully");
    } catch (error) {
      next(error);
    }
  }
}

export const citizenController = new CitizenController();
export default citizenController;
