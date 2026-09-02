export type UserRole = "CITIZEN" | "OFFICER" | "SENIOR_OFFICER" | "ADMIN";

export interface JwtUserPayload {
  id: string;
  email: string;
  role: UserRole;
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
