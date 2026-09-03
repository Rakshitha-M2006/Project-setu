import axiosClient from "./axiosClient";
import { ApiResponse, Priority, GrievanceStatus } from "../types";

export interface AnalyticsFilterParams {
  startDate?: string;
  endDate?: string;
  departmentId?: string;
  categoryId?: string;
  priority?: Priority | "ALL";
  status?: GrievanceStatus | "ALL";
}

export interface AnalyticsOverviewData {
  summary: {
    totalGrievances: number;
    resolvedGrievances: number;
    pendingGrievances: number;
    overdueGrievances: number;
    criticalGrievances: number;
    resolutionRate: number;
    avgResolutionHours: number;
    slaComplianceRate: number;
    citizenSatisfactionScore: number;
    totalFeedbacks: number;
  };
  grievancesByDepartment: Array<{
    id: string;
    code: string;
    name: string;
    total: number;
    resolved: number;
    pending: number;
    overdue: number;
    resolutionRate: number;
  }>;
  grievancesByCategory: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  grievancesByPriority: Array<{
    priority: Priority;
    count: number;
    percentage: number;
  }>;
  grievancesByStatus: Array<{
    status: GrievanceStatus;
    count: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    submitted: number;
    resolved: number;
  }>;
  slaMetrics: {
    withinSla: number;
    breachedSla: number;
    complianceRate: number;
  };
  citizenSatisfaction: {
    averageRating: number;
    totalRatings: number;
    ratingBreakdown: Record<number, number>;
    satisfiedPercentage: number;
  };
  departmentPerformance: Array<{
    departmentId: string;
    code: string;
    name: string;
    totalGrievances: number;
    resolvedGrievances: number;
    resolutionRate: number;
    avgResolutionHours: number;
    slaComplianceRate: number;
    avgRating: number;
  }>;
  locationDistribution: Array<{
    pincode: string;
    count: number;
    resolved: number;
  }>;
}

export const analyticsApi = {
  getOverviewAnalytics: async (
    params?: AnalyticsFilterParams
  ): Promise<ApiResponse<AnalyticsOverviewData>> => {
    const response = await axiosClient.get<ApiResponse<AnalyticsOverviewData>>("/analytics/overview", {
      params,
    });
    return response.data;
  },
};

export default analyticsApi;
