export type UserRole = "CITIZEN" | "OFFICER" | "SENIOR_OFFICER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
  departmentId?: string | null;
  department?: {
    id: string;
    code: string;
    name: string;
  } | null;
}

export type GrievanceStatus =
  | "SUBMITTED"
  | "AI_TRIAGED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "REJECTED"
  | "ESCALATED";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  slaHoursDefault: number;
}

export interface Grievance {
  id: string;
  trackingNumber: string;
  citizenId: string;
  departmentId?: string | null;
  department?: Department | null;
  title: string;
  description: string;
  location?: string | null;
  pincode?: string | null;
  status: GrievanceStatus;
  priority: Priority;
  aiConfidenceScore?: number | null;
  slaDeadline?: string | null;
  isEscalated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  errors?: any;
}
