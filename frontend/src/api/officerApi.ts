import axiosClient from "./axiosClient";
import { ApiResponse, GrievanceStatus } from "../types";
import { GrievanceItem } from "./citizenApi";

export interface OfficerDashboardStats {
  metrics: {
    totalAssigned: number;
    pending: number;
    inProgress: number;
    resolved: number;
    highPriority: number;
    overdue: number;
    departmentUnassigned: number;
  };
  officer: {
    id: string;
    badgeNumber?: string | null;
    designation: string;
    jurisdictionWard?: string | null;
    department: string;
    departmentCode: string;
    isAvailable: boolean;
  };
  recentGrievances: GrievanceItem[];
}

export interface OfficerGrievanceListResponse {
  items: GrievanceItem[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface OfficerProfileData {
  id: string;
  userId: string;
  badgeNumber?: string | null;
  designation: string;
  jurisdictionWard?: string | null;
  isAvailable: boolean;
  activeGrievanceCount: number;
  resolvedGrievanceCount: number;
  departmentId: string;
  department: {
    id: string;
    code: string;
    name: string;
    defaultSlaHours: number;
  };
  user: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    role: string;
  };
}

export const officerApi = {
  /**
   * Fetch officer dashboard metrics and stats
   */
  getDashboardStats: async (): Promise<ApiResponse<OfficerDashboardStats>> => {
    const response = await axiosClient.get<ApiResponse<OfficerDashboardStats>>(
      "/officer/dashboard-stats"
    );
    return response.data;
  },

  /**
   * List grievances with search, filter, sort, and pagination
   */
  getOfficerGrievances: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    categoryId?: string;
    search?: string;
    scope?: "assigned_to_me" | "department_unassigned" | "department_all";
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<ApiResponse<OfficerGrievanceListResponse>> => {
    const response = await axiosClient.get<ApiResponse<OfficerGrievanceListResponse>>(
      "/officer/grievances",
      { params }
    );
    return response.data;
  },

  /**
   * Fetch grievance details by ID for official audit/investigation
   */
  getGrievanceById: async (id: string): Promise<ApiResponse<GrievanceItem>> => {
    const response = await axiosClient.get<ApiResponse<GrievanceItem>>(`/officer/grievances/${id}`);
    return response.data;
  },

  /**
   * Officer accepts/claims a grievance
   */
  acceptGrievance: async (id: string): Promise<ApiResponse<GrievanceItem>> => {
    const response = await axiosClient.post<ApiResponse<GrievanceItem>>(
      `/officer/grievances/${id}/accept`
    );
    return response.data;
  },

  /**
   * Update grievance status with remarks and resolution summary
   */
  updateStatus: async (
    id: string,
    payload: { status: GrievanceStatus; remarks: string; resolutionSummary?: string }
  ): Promise<ApiResponse<GrievanceItem>> => {
    const response = await axiosClient.patch<ApiResponse<GrievanceItem>>(
      `/officer/grievances/${id}/status`,
      payload
    );
    return response.data;
  },

  /**
   * Upload resolution evidence or inspection report
   */
  uploadEvidence: async (
    id: string,
    payload: {
      fileName: string;
      originalName: string;
      fileUrl: string;
      mimeType: string;
      fileSizeBytes: number;
      remarks?: string;
    }
  ): Promise<ApiResponse<any>> => {
    const response = await axiosClient.post<ApiResponse<any>>(
      `/officer/grievances/${id}/evidence`,
      payload
    );
    return response.data;
  },

  /**
   * Request additional information from citizen
   */
  requestInfo: async (id: string, payload: { message: string }): Promise<ApiResponse<any>> => {
    const response = await axiosClient.post<ApiResponse<any>>(
      `/officer/grievances/${id}/request-info`,
      payload
    );
    return response.data;
  },

  /**
   * Fetch officer profile
   */
  getProfile: async (): Promise<ApiResponse<OfficerProfileData>> => {
    const response = await axiosClient.get<ApiResponse<OfficerProfileData>>("/officer/profile");
    return response.data;
  },

  /**
   * Update officer profile details & availability
   */
  updateProfile: async (payload: {
    isAvailable?: boolean;
    designation?: string;
    phone?: string;
    jurisdictionWard?: string;
  }): Promise<ApiResponse<OfficerProfileData>> => {
    const response = await axiosClient.put<ApiResponse<OfficerProfileData>>(
      "/officer/profile",
      payload
    );
    return response.data;
  },
};

export default officerApi;
