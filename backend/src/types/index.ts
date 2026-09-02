import { Role, Priority, GrievanceStatus, ApplicationStatus } from "@prisma/client";

export type UserRole = Role;

export interface JwtUserPayload {
  id: string;
  email: string;
  role: Role;
  fullName: string;
  departmentId?: string | null;
}

export interface GrievanceAIAnalysisResult {
  category: string;
  suggested_department: string;
  confidence_score: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  estimated_sla_hours: number;
  extracted_keywords: string[];
  sentiment: string;
  is_urgent: boolean;
  summary: string;
}

export interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  service: string;
  version: string;
  environment: string;
  timestamp: string;
  uptime: {
    seconds: number;
    formatted: string;
  };
  system: {
    nodeVersion: string;
    platform: string;
    architecture: string;
    memoryUsage: {
      rssMb: number;
      heapTotalMb: number;
      heapUsedMb: number;
    };
  };
  dependencies: {
    database: {
      status: "connected" | "disconnected";
      engine: string;
      responseTimeMs?: number;
      error?: string;
    };
    aiMicroservice: {
      status: "connected" | "unreachable";
      endpoint: string;
      responseTimeMs?: number;
    };
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
