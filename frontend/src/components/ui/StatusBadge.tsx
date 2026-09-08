import React from "react";
import { cn } from "../../utils/cn";
import { useLanguage } from "../../context/LanguageContext";
import {
  GrievanceStatus,
  Priority,
  ApplicationStatus,
  Role,
} from "../../types";

export interface StatusBadgeProps {
  status?: GrievanceStatus | ApplicationStatus | Priority | Role | string;
  type?: "status" | "priority" | "application" | "role" | "grievance";
  className?: string;
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = "status",
  className,
  size = "md",
}) => {
  const { t } = useLanguage();
  if (!status) return null;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-0.5 text-xs",
  };

  const isPriority =
    type === "priority" ||
    ["PENDING_AI", "CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(status);

  const isRole =
    type === "role" ||
    ["CITIZEN", "OFFICER", "SENIOR_OFFICER", "ADMIN"].includes(status);

  const isExplicitApplication = type === "application";
  const isExplicitGrievance = type === "grievance";

  // Auto-detection when type is generic "status"
  const isGrievanceStatus =
    isExplicitGrievance ||
    (!isExplicitApplication &&
      [
        "AI_CLASSIFIED",
        "AI_TRIAGED",
        "DEPARTMENT_ASSIGNED",
        "OFFICER_PENDING",
        "AI_REVIEW_REQUIRED",
        "NEEDS_REVIEW",
        "ASSIGNED",
        "IN_PROGRESS",
        "UNDER_INSPECTION",
        "ESCALATED",
        "REOPENED",
        "RESOLVED",
        "CLOSED",
      ].includes(status));

  const isApplicationStatus =
    isExplicitApplication ||
    (!isExplicitGrievance &&
      ["DRAFT", "DOCUMENT_VERIFICATION", "APPROVED", "COMPLETED"].includes(
        status
      ));

  const getStyle = () => {
    // 1. Priority Styles
    if (isPriority) {
      switch (status) {
        case "PENDING_AI":
          return "bg-purple-50 text-purple-700 border-purple-200 font-medium";
        case "CRITICAL":
          return "bg-rose-100 text-rose-800 border-rose-200 font-bold";
        case "HIGH":
          return "bg-amber-100 text-amber-800 border-amber-200 font-semibold";
        case "MEDIUM":
          return "bg-blue-100 text-blue-800 border-blue-200 font-medium";
        case "LOW":
          return "bg-slate-100 text-slate-700 border-slate-200 font-normal";
      }
    }

    // 2. Role Styles
    if (isRole) {
      switch (status) {
        case "CITIZEN":
          return "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium";
        case "OFFICER":
          return "bg-blue-50 text-blue-700 border-blue-200 font-semibold";
        case "SENIOR_OFFICER":
          return "bg-indigo-50 text-indigo-700 border-indigo-200 font-bold";
        case "ADMIN":
          return "bg-purple-50 text-purple-700 border-purple-200 font-bold";
      }
    }

    // 3. Grievance Tracking Specific Styles
    if (isGrievanceStatus) {
      switch (status) {
        case "SUBMITTED":
          return "bg-blue-50 text-blue-700 border-blue-200 font-medium";
        case "AI_CLASSIFIED":
        case "AI_TRIAGED":
        case "AI_REVIEW_REQUIRED":
        case "NEEDS_REVIEW":
        case "UNDER_REVIEW":
          return "bg-purple-50 text-purple-700 border-purple-200 font-medium";
        case "DEPARTMENT_ASSIGNED":
        case "OFFICER_PENDING":
        case "ASSIGNED":
          return "bg-indigo-50 text-indigo-700 border-indigo-200 font-medium";
        case "IN_PROGRESS":
        case "UNDER_INSPECTION":
          return "bg-amber-100 text-amber-800 border-amber-200 font-medium animate-pulse-subtle";
        case "ESCALATED":
          return "bg-red-100 text-red-900 border-red-300 font-bold tracking-wide";
        case "REOPENED":
          return "bg-orange-100 text-orange-900 border-orange-200 font-semibold";
        case "RESOLVED":
          return "bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold";
        case "CLOSED":
        case "COMPLETED":
          return "bg-slate-100 text-slate-700 border-slate-300 font-medium";
        case "REJECTED":
          return "bg-rose-100 text-rose-800 border-rose-200 font-medium";
        default:
          return "bg-slate-100 text-slate-800 border-slate-200";
      }
    }

    // 4. Application Tracking Specific Styles
    if (isApplicationStatus) {
      switch (status) {
        case "DRAFT":
          return "bg-slate-100 text-slate-700 border-slate-200";
        case "SUBMITTED":
          return "bg-blue-50 text-blue-700 border-blue-200 font-medium";
        case "DOCUMENT_VERIFICATION":
          return "bg-amber-100 text-amber-800 border-amber-200 font-medium";
        case "UNDER_REVIEW":
          return "bg-amber-100 text-amber-800 border-amber-200 font-medium animate-pulse-subtle";
        case "APPROVED":
          return "bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold";
        case "REJECTED":
          return "bg-rose-100 text-rose-800 border-rose-200 font-medium";
        case "COMPLETED":
          return "bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold";
        default:
          return "bg-slate-100 text-slate-800 border-slate-200";
      }
    }

    // 5. Fallback Status Styles
    switch (status) {
      case "SUBMITTED":
      case "DRAFT":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "RESOLVED":
      case "APPROVED":
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold";
      case "REJECTED":
        return "bg-rose-100 text-rose-800 border-rose-200 font-medium";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const formatText = (text: string) => {
    const key = text.toLowerCase();

    // Priority formatting
    if (isPriority) {
      const trans = t(`priority.${key}`);
      if (trans && trans !== `priority.${key}`) return trans;
    }

    // Role formatting
    if (isRole) {
      const trans = t(`role.${key}`);
      if (trans && trans !== `role.${key}`) return trans;
    }

    // Grievance Tracking terminology (Strict 6 Stages + Rejected)
    if (isGrievanceStatus) {
      switch (text) {
        case "SUBMITTED":
          return t("grievanceStatus.grievanceSubmitted") || "Grievance Submitted";
        case "AI_CLASSIFIED":
        case "AI_TRIAGED":
        case "AI_REVIEW_REQUIRED":
        case "NEEDS_REVIEW":
        case "UNDER_REVIEW":
          return t("grievanceStatus.grievanceUnderReview") || "Under Review";
        case "DEPARTMENT_ASSIGNED":
        case "OFFICER_PENDING":
        case "ASSIGNED":
          return t("grievanceStatus.grievanceAssigned") || "Assigned to Department";
        case "IN_PROGRESS":
        case "UNDER_INSPECTION":
        case "ESCALATED":
        case "REOPENED":
          return t("grievanceStatus.grievanceActionInProgress") || "Action In Progress";
        case "RESOLVED":
          return t("grievanceStatus.grievanceResolved") || "Resolved";
        case "CLOSED":
        case "COMPLETED":
          return t("grievanceStatus.grievanceClosed") || "Closed";
        case "REJECTED":
          return t("grievanceStatus.grievanceRejected") || t("status.rejected") || "Rejected";
        default:
          return text.replace(/_/g, " ");
      }
    }

    // Application Tracking terminology
    if (isApplicationStatus) {
      switch (text) {
        case "DRAFT":
          return t("applicationStatus.draft") || t("status.draft") || "Draft";
        case "SUBMITTED":
          return t("applicationStatus.submitted") || "Application Submitted";
        case "DOCUMENT_VERIFICATION":
          return t("applicationStatus.docVerification") || "Documents Verified";
        case "UNDER_REVIEW":
          return t("applicationStatus.underReview") || "Application Under Review";
        case "APPROVED":
          return t("applicationStatus.approved") || t("status.approved") || "Approved";
        case "REJECTED":
          return t("applicationStatus.rejected") || t("status.rejected") || "Rejected";
        case "COMPLETED":
          return t("applicationStatus.completed") || t("status.completed") || "Completed";
        default:
          return text.replace(/_/g, " ");
      }
    }

    // Generic status formatting fallback
    const trans = t(`status.${key}`);
    if (trans && trans !== `status.${key}`) return trans;
    return text.replace(/_/g, " ");
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border leading-tight",
        sizeClasses[size],
        getStyle(),
        className
      )}
    >
      {formatText(status)}
    </span>
  );
};

export default StatusBadge;
