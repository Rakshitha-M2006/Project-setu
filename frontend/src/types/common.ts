export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors?: Array<{ field?: string; message: string; rule?: string }>;
  timestamp: string;
}

export type GrievanceStatus =
  | "SUBMITTED"
  | "AI_CLASSIFIED"
  | "DEPARTMENT_ASSIGNED"
  | "OFFICER_PENDING"
  | "AI_REVIEW_REQUIRED"
  | "NEEDS_REVIEW"
  | "AI_TRIAGED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "UNDER_INSPECTION"
  | "RESOLVED"
  | "REJECTED"
  | "ESCALATED"
  | "REOPENED";

export type Priority = "PENDING_AI" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "DOCUMENT_VERIFICATION"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}
