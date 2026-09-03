import axiosClient from "./axiosClient";
import { ApiResponse, Role, Priority } from "../types";

export interface AdminDashboardStats {
  totalCitizens: number;
  totalOfficers: number;
  totalGrievances: number;
  pendingGrievances: number;
  resolvedGrievances: number;
  overdueGrievances: number;
  criticalGrievances: number;
  totalApplications: number;
  resolutionRate: number;
  avgResolutionHours: number;
  departments: Array<{
    id: string;
    name: string;
    code: string;
    _count: { grievances: number; officers: number };
  }>;
}

export interface AdminUserItem {
  id: string;
  email: string;
  phone?: string | null;
  fullName: string;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
  citizenProfile?: { addressLine1?: string | null; pincode?: string | null } | null;
  officerProfile?: { badgeNumber?: string | null; designation?: string | null; department?: { name: string } } | null;
}

export interface AdminOfficerItem {
  id: string;
  badgeNumber?: string | null;
  designation: string;
  jurisdictionWard?: string | null;
  isAvailable: boolean;
  activeGrievanceCount: number;
  resolvedGrievanceCount: number;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    role: Role;
    isActive: boolean;
  };
  department: {
    id: string;
    name: string;
    code: string;
  };
  _count: { assignments: number };
}

export interface AdminDepartmentItem {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  nodalOfficerName?: string | null;
  nodalOfficerEmail?: string | null;
  nodalOfficerPhone?: string | null;
  defaultSlaHours: number;
  escalationSlaHours: number;
  isActive: boolean;
  _count?: { grievances: number; officers: number; services: number };
}

export interface AdminCategoryItem {
  id: string;
  name: string;
  code?: string | null;
  defaultPriority: Priority;
  defaultSlaHours: number;
  isActive: boolean;
  department?: { id: string; name: string; code: string };
}

export interface AdminAuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  actor?: {
    id: string;
    fullName: string;
    email: string;
    role: Role;
  } | null;
  changes?: any;
  metadata?: any;
}

export interface AdminAiMonitoringData {
  totalClassified: number;
  highConfidenceCount: number;
  avgConfidence: number;
  autoTriageRate: number;
  recentInferences: Array<{
    id: string;
    confidenceScore: number;
    priorityScore: Priority;
    detectedSentiment: string;
    suggestedSlaHours: number;
    createdAt: string;
    predictedDepartment?: { name: string; code: string } | null;
    predictedCategory?: { name: string } | null;
    grievance: { trackingNumber: string; title: string; priority: Priority };
  }>;
}

export const adminApi = {
  getDashboardStats: async (): Promise<ApiResponse<AdminDashboardStats>> => {
    const response = await axiosClient.get<ApiResponse<AdminDashboardStats>>("/admin/dashboard-stats");
    return response.data;
  },

  getUsers: async (params?: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ users: AdminUserItem[]; pagination: any }>> => {
    const response = await axiosClient.get<ApiResponse<{ users: AdminUserItem[]; pagination: any }>>(
      "/admin/users",
      { params }
    );
    return response.data;
  },

  toggleUserStatus: async (userId: string, isActive: boolean): Promise<ApiResponse<any>> => {
    const response = await axiosClient.patch<ApiResponse<any>>(`/admin/users/${userId}/status`, {
      isActive,
    });
    return response.data;
  },

  getOfficers: async (params?: { departmentId?: string; search?: string }): Promise<ApiResponse<AdminOfficerItem[]>> => {
    const response = await axiosClient.get<ApiResponse<AdminOfficerItem[]>>("/admin/officers", { params });
    return response.data;
  },

  createDepartment: async (payload: any): Promise<ApiResponse<AdminDepartmentItem>> => {
    const response = await axiosClient.post<ApiResponse<AdminDepartmentItem>>("/admin/departments", payload);
    return response.data;
  },

  updateDepartment: async (id: string, payload: any): Promise<ApiResponse<AdminDepartmentItem>> => {
    const response = await axiosClient.put<ApiResponse<AdminDepartmentItem>>(`/admin/departments/${id}`, payload);
    return response.data;
  },

  getCategories: async (params?: { departmentId?: string }): Promise<ApiResponse<AdminCategoryItem[]>> => {
    const response = await axiosClient.get<ApiResponse<AdminCategoryItem[]>>("/admin/categories", { params });
    return response.data;
  },

  createCategory: async (payload: any): Promise<ApiResponse<AdminCategoryItem>> => {
    const response = await axiosClient.post<ApiResponse<AdminCategoryItem>>("/admin/categories", payload);
    return response.data;
  },

  getGrievances: async (params?: {
    status?: string;
    priority?: string;
    departmentId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ grievances: any[]; pagination: any }>> => {
    const response = await axiosClient.get<ApiResponse<{ grievances: any[]; pagination: any }>>(
      "/admin/grievances",
      { params }
    );
    return response.data;
  },

  getAuditLogs: async (params?: {
    search?: string;
    actorId?: string;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ logs: AdminAuditLogItem[]; pagination: any }>> => {
    const response = await axiosClient.get<ApiResponse<{ logs: AdminAuditLogItem[]; pagination: any }>>(
      "/admin/audit-logs",
      { params }
    );
    return response.data;
  },

  getAiMonitoring: async (): Promise<ApiResponse<AdminAiMonitoringData>> => {
    const response = await axiosClient.get<ApiResponse<AdminAiMonitoringData>>("/admin/ai-monitoring");
    return response.data;
  },
};

export default adminApi;
