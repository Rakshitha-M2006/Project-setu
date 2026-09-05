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
  assignments?: Array<{
    id: string;
    officerProfileId?: string;
    officerProfile?: {
      id?: string;
      designation?: string;
      badgeNumber?: string | null;
      user?: { id?: string; email?: string; fullName?: string };
    };
    isActive: boolean;
  }>;
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

export interface SchemeItem {
  id: string;
  code: string;
  name: string;
  slug: string;
  sponsoringAgency: string;
  category: string;
  shortDescription: string;
  overview: string;
  benefits: string[];
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  officialPortalUrl: string;
  applicationMethod: string;
  tags: string[];
  isActive: boolean;
  translations?: Record<string, { name: string; shortDescription: string }>;
}

export interface ServiceItem {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  department?: Department;
  category?: string;
  isExternal?: boolean;
  applicationType?: "INTERNAL" | "EXTERNAL";
  officialPortalUrl?: string | null;
  guidanceInstructions?: string[] | null;
  description?: string | null;
  eligibilityCriteria?: string | null;
  requiredDocuments?: string[] | null;
  feeAmount: number;
  estimatedProcessingDays: number;
  isActive: boolean;
}

export interface ServiceDocumentItem {
  id: string;
  documentType: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
  isVerified?: boolean;
}

export interface ServiceApplicationItem {
  id: string;
  applicationNumber: string;
  citizenId: string;
  citizen?: { id: string; fullName: string; email: string; phone?: string | null };
  serviceId: string;
  service: ServiceItem;
  departmentId: string;
  department: Department;
  status: ApplicationStatus;
  formData: any;
  officerRemarks?: string | null;
  reviewingOfficer?: { id: string; fullName: string; email: string } | null;
  documents?: ServiceDocumentItem[];
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

export interface ServiceFieldRequirement {
  id: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea" | "boolean";
  requirement: "REQUIRED" | "OPTIONAL" | "CONDITIONAL";
  placeholder?: string;
  helperText?: string;
  options?: Array<{ value: string; label: string }>;
  condition?: {
    field: string;
    operator: "equals" | "not_equals" | "truthy" | "greater_than";
    value: any;
  };
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface ServiceDocumentRequirement {
  code: string;
  name: string;
  description: string;
  requirement: "REQUIRED" | "OPTIONAL";
  allowedMimeTypes: string[];
  maxSizeBytes: number;
}

export interface ServiceRequirementsSchema {
  code: string;
  name: string;
  departmentCode: string;
  category: string;
  description: string;
  eligibility: string[];
  estimatedDays: number;
  feeAmount: number;
  fields: {
    personal: ServiceFieldRequirement[];
    contact: ServiceFieldRequirement[];
    address: ServiceFieldRequirement[];
    serviceSpecific: ServiceFieldRequirement[];
  };
  documents: ServiceDocumentRequirement[];
  declarationText: string;
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
  submitGrievance: async (
    payload: SubmitGrievancePayload
  ): Promise<
    ApiResponse<{
      grievance: GrievanceItem;
      trackingNumber: string;
      category?: string;
      department?: string;
      priority?: Priority;
      status?: GrievanceStatus;
      slaDeadline?: string;
    }>
  > => {
    const response = await axiosClient.post<
      ApiResponse<{
        grievance: GrievanceItem;
        trackingNumber: string;
        category?: string;
        department?: string;
        priority?: Priority;
        status?: GrievanceStatus;
        slaDeadline?: string;
      }>
    >("/grievances", payload);
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
  getServices: async (params?: { departmentId?: string; search?: string; category?: string }): Promise<ApiResponse<ServiceItem[]>> => {
    const response = await axiosClient.get<ApiResponse<ServiceItem[]>>("/services", { params });
    return response.data;
  },

  /**
   * Fetch quick starter actions for SETU Assistant
   */
  getAssistantQuickActions: async (): Promise<ApiResponse<any>> => {
    const response = await axiosClient.get<ApiResponse<any>>("/assistant/quick-actions");
    return response.data;
  },

  /**
   * Fetch specific government service details by ID or code
   */
  getServiceById: async (id: string): Promise<ApiResponse<ServiceItem>> => {
    const response = await axiosClient.get<ApiResponse<ServiceItem>>(`/services/${id}`);
    return response.data;
  },

  /**
   * Fetch service requirements and dynamic schema
   */
  getServiceRequirements: async (serviceId: string): Promise<ApiResponse<ServiceRequirementsSchema>> => {
    const response = await axiosClient.get<ApiResponse<ServiceRequirementsSchema>>(
      `/services/${serviceId}/requirements`
    );
    return response.data;
  },

  /**
   * Fetch citizen's submitted service applications
   */
  getMyApplications: async (params?: { status?: string }): Promise<ApiResponse<ServiceApplicationItem[]>> => {
    const response = await axiosClient.get<ApiResponse<ServiceApplicationItem[]>>(
      "/services/my/applications",
      { params }
    );
    return response.data;
  },

  /**
   * Fetch specific service application details by ID or applicationNumber
   */
  getApplicationById: async (id: string): Promise<ApiResponse<ServiceApplicationItem>> => {
    const response = await axiosClient.get<ApiResponse<ServiceApplicationItem>>(
      `/services/applications/${id}`
    );
    return response.data;
  },

  /**
   * Apply for a government service
   */
  applyForService: async (
    serviceId: string,
    payload: {
      formData: any;
      isDraft?: boolean;
      documents?: Array<{
        documentType: string;
        fileName: string;
        originalName: string;
        fileUrl: string;
        mimeType: string;
        fileSizeBytes: number;
      }>;
    }
  ): Promise<
    ApiResponse<{
      application: ServiceApplicationItem;
      applicationNumber: string;
      serviceName: string;
      departmentName: string;
      estimatedDays: number;
    }>
  > => {
    const response = await axiosClient.post<
      ApiResponse<{
        application: ServiceApplicationItem;
        applicationNumber: string;
        serviceName: string;
        departmentName: string;
        estimatedDays: number;
      }>
    >(`/services/${serviceId}/apply`, payload);
    return response.data;
  },

  /**
   * Fetch user notifications
   */
  getNotifications: async (params?: { filter?: string; limit?: number }): Promise<ApiResponse<any>> => {
    const response = await axiosClient.get<ApiResponse<any>>("/notifications", { params });
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

  /**
   * Query SETU AI Assistant
   */
  chatWithAssistant: async (payload: {
    message: string;
    language?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await axiosClient.post<ApiResponse<any>>("/assistant/chat", payload);
    return response.data;
  },

  /**
   * Fetch government schemes catalog
   */
  getSchemes: async (params?: { q?: string; category?: string; state?: string; limit?: number; offset?: number }): Promise<ApiResponse<any>> => {
    const response = await axiosClient.get<ApiResponse<any>>("/schemes", { params });
    return response.data;
  },

  /**
   * Fetch government scheme details by slug or code
   */
  getSchemeDetails: async (slugOrCode: string): Promise<ApiResponse<any>> => {
    const response = await axiosClient.get<ApiResponse<any>>(`/schemes/${slugOrCode}`);
    return response.data;
  },

  /**
   * Check preliminary scheme eligibility
   */
  checkSchemeEligibility: async (slugOrCode: string, payload: any): Promise<ApiResponse<any>> => {
    const response = await axiosClient.post<ApiResponse<any>>(`/schemes/${slugOrCode}/check-eligibility`, payload);
    return response.data;
  },

  /**
   * Get 16-category service catalog with internal vs external metadata
   */
  getCategorizedServices: async (params?: { search?: string; category?: string }): Promise<ApiResponse<any>> => {
    const response = await axiosClient.get<ApiResponse<any>>("/services/catalog/categorized", { params });
    return response.data;
  },

  /**
   * Global citizen search across services and schemes
   */
  globalSearch: async (query: string): Promise<ApiResponse<any>> => {
    const response = await axiosClient.get<ApiResponse<any>>("/services/global/search", { params: { q: query } });
    return response.data;
  },
};

export default citizenApi;
