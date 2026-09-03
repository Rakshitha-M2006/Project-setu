import axiosClient from "./axiosClient";
import { ApiResponse, Department, GrievanceStatus, Priority, ApplicationStatus } from "../types";

export interface GrievanceAttachmentItem {
  id?: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
  isResolutionEvidence?: boolean;
  uploadedAt?: string;
}

export interface GrievanceStatusHistoryItem {
  id: string;
  actionTaken: string;
  previousStatus?: GrievanceStatus | null;
  newStatus: GrievanceStatus;
  remarks?: string | null;
  createdAt: string;
  actor?: { id: string; fullName: string; role: string } | null;
}

export interface GrievanceLocationItem {
  id: string;
  state: string;
  district: string;
  subDistrict?: string | null;
  blockOrWard?: string | null;
  locality?: string | null;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface GrievanceItem {
  id: string;
  trackingNumber: string;
  citizenId: string;
  title: string;
  description: string;
  addressText?: string | null;
  pincode?: string | null;
  status: GrievanceStatus;
  priority: Priority;
  isUrgent: boolean;
  slaDeadline?: string | null;
  slaBreached?: boolean;
  isEscalated?: boolean;
  resolutionSummary?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  department?: Department | null;
  category?: { id: string; name: string; code?: string | null } | null;
  location?: GrievanceLocationItem | null;
  attachments?: GrievanceAttachmentItem[];
  statusHistories?: GrievanceStatusHistoryItem[];
  citizen?: { id: string; fullName: string; email: string; phone?: string | null };
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  linkUrl?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface CitizenDashboardStats {
  metrics: {
    totalGrievances: number;
    pendingGrievances: number;
    inProgressGrievances: number;
    resolvedGrievances: number;
    activeApplications: number;
    unreadNotificationsCount: number;
  };
  recentGrievances: GrievanceItem[];
  recentNotifications: NotificationItem[];
}

export interface ServiceItem {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  department?: Department;
  description?: string | null;
  eligibilityCriteria?: string | null;
  requiredDocuments?: string[] | null;
  feeAmount: number;
  estimatedProcessingDays: number;
  isActive: boolean;
}

export interface ServiceApplicationItem {
  id: string;
  applicationNumber: string;
  citizenId: string;
  serviceId: string;
  service: ServiceItem;
  departmentId: string;
  department: Department;
  status: ApplicationStatus;
  formData: any;
  officerRemarks?: string | null;
  reviewingOfficer?: { id: string; fullName: string; email: string } | null;
  submittedAt: string;
  completedAt?: string | null;
}

export interface SubmitGrievancePayload {
  title: string;
  description: string;
  categoryId?: string | null;
  departmentId?: string | null;
  addressText?: string | null;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locality?: string | null;
  district?: string | null;
  state?: string | null;
  additionalDetails?: string | null;
  attachments?: Array<{
    fileName: string;
    originalName: string;
    fileUrl: string;
    mimeType: string;
    fileSizeBytes: number;
  }>;
}

export const citizenApi = {
  /**
   * Fetch real-time dashboard statistics, recent grievances, and notifications
   */
  getDashboardStats: async (): Promise<ApiResponse<CitizenDashboardStats>> => {
    const response = await axiosClient.get<ApiResponse<CitizenDashboardStats>>(
      "/citizen/dashboard-stats"
    );
    return response.data;
  },

  /**
   * Fetch complete citizen profile
   */
  getProfile: async (): Promise<ApiResponse<any>> => {
    const response = await axiosClient.get<ApiResponse<any>>("/citizen/profile");
    return response.data;
  },

  /**
   * Update citizen profile
   */
  updateProfile: async (payload: any): Promise<ApiResponse<any>> => {
    const response = await axiosClient.put<ApiResponse<any>>("/citizen/profile", payload);
    return response.data;
  },

  /**
   * Get all grievances submitted by current citizen (GET /api/v1/grievances/my)
   */
  getMyGrievances: async (params?: { status?: string; priority?: string; search?: string }): Promise<ApiResponse<GrievanceItem[]>> => {
    const response = await axiosClient.get<ApiResponse<GrievanceItem[]>>("/grievances/my", { params });
    return response.data;
  },

  /**
   * Get grievance details by ID or trackingNumber (GET /api/v1/grievances/:id)
   */
  getGrievanceById: async (id: string): Promise<ApiResponse<GrievanceItem>> => {
    const response = await axiosClient.get<ApiResponse<GrievanceItem>>(`/grievances/${id}`);
    return response.data;
  },

  /**
   * Submit a new grievance (POST /api/v1/grievances)
   */
  submitGrievance: async (payload: SubmitGrievancePayload): Promise<ApiResponse<{ grievance: GrievanceItem; trackingNumber: string }>> => {
    const response = await axiosClient.post<ApiResponse<{ grievance: GrievanceItem; trackingNumber: string }>>(
      "/grievances",
      payload
    );
    return response.data;
  },

  /**
   * Fetch all active government departments & problem categories
   */
  getDepartments: async (): Promise<ApiResponse<Department[]>> => {
    const response = await axiosClient.get<ApiResponse<Department[]>>("/departments");
    return response.data;
  },

  /**
   * Fetch available government services catalog
   */
  getServices: async (): Promise<ApiResponse<ServiceItem[]>> => {
    const response = await axiosClient.get<ApiResponse<ServiceItem[]>>("/services");
    return response.data;
  },

  /**
   * Fetch citizen's submitted service applications
   */
  getMyApplications: async (): Promise<ApiResponse<ServiceApplicationItem[]>> => {
    const response = await axiosClient.get<ApiResponse<ServiceApplicationItem[]>>(
      "/services/my/applications"
    );
    return response.data;
  },

  /**
   * Apply for a government service
   */
  applyForService: async (serviceId: string, formData: any): Promise<ApiResponse<ServiceApplicationItem>> => {
    const response = await axiosClient.post<ApiResponse<ServiceApplicationItem>>(
      `/services/${serviceId}/apply`,
      { formData }
    );
    return response.data;
  },

  /**
   * Fetch user notifications
   */
  getNotifications: async (): Promise<ApiResponse<NotificationItem[]>> => {
    const response = await axiosClient.get<ApiResponse<NotificationItem[]>>("/notifications");
    return response.data;
  },

  /**
   * Mark notification as read
   */
  markNotificationRead: async (id: string): Promise<ApiResponse<any>> => {
    const response = await axiosClient.patch<ApiResponse<any>>(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllNotificationsRead: async (): Promise<ApiResponse<any>> => {
    const response = await axiosClient.post<ApiResponse<any>>("/notifications/mark-all-read");
    return response.data;
  },
};

export default citizenApi;
