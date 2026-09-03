import React from "react";
import { cn } from "../../utils/cn";
import {
  GrievanceStatus,
  Priority,
  ApplicationStatus,
  Role,
} from "../../types";

export interface StatusBadgeProps {
  status?: GrievanceStatus | ApplicationStatus | Priority | Role | string;
  type?: "status" | "priority" | "application" | "role";
  className?: string;
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = "status",
  className,
  size = "md",
}) => {
  if (!status) return null;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-0.5 text-xs",
  };

  const getStyle = () => {
    // 1. Priority Styles
    if (type === "priority" || status === "PENDING_AI" || status === "CRITICAL" || status === "HIGH" || status === "MEDIUM" || status === "LOW") {
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
    if (type === "role" || status === "CITIZEN" || status === "OFFICER" || status === "SENIOR_OFFICER" || status === "ADMIN") {
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

    // 3. Status & Application Styles
    switch (status) {
      case "SUBMITTED":
      case "DRAFT":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "AI_TRIAGED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "ASSIGNED":
        return "bg-sky-100 text-sky-800 border-sky-200";
      case "IN_PROGRESS":
      case "UNDER_REVIEW":
      case "DOCUMENT_VERIFICATION":
      case "UNDER_INSPECTION":
        return "bg-amber-100 text-amber-800 border-amber-200 animate-pulse-subtle";
      case "RESOLVED":
      case "APPROVED":
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold";
      case "REJECTED":
        return "bg-rose-100 text-rose-800 border-rose-200 font-medium";
      case "ESCALATED":
        return "bg-red-100 text-red-900 border-red-300 font-bold tracking-wide";
      case "REOPENED":
        return "bg-orange-100 text-orange-900 border-orange-200 font-semibold";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, " ");
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border leading-tight capitalize",
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
