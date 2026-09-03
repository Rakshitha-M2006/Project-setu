import { Priority, EscalationLevel } from "@prisma/client";

/**
 * PROJECT SETU — Configurable SLA Master Configuration
 * All SLA turnaround values are measured in continuous working hours.
 */

export interface SlaPriorityConfig {
  hours: number;
  label: string;
  description: string;
  warningThresholdPercentage: number; // e.g. 0.75 = warning at 75% of time elapsed
}

export const SLA_CONFIG: Record<Priority, SlaPriorityConfig> = {
  CRITICAL: {
    hours: 24, // 24 hours
    label: "24 Hours (Urgent Hazard)",
    description: "Immediate public safety, hazardous leaks, or critical hospital/school lifeline breakdowns",
    warningThresholdPercentage: 0.7,
  },
  HIGH: {
    hours: 48, // 48 hours / 2 days
    label: "48 Hours (High Priority)",
    description: "Major civic disruptions, power outages, or water supply contaminations",
    warningThresholdPercentage: 0.75,
  },
  MEDIUM: {
    hours: 72, // 3 days / 72 hours
    label: "3 Days (Standard Priority)",
    description: "Regular public complaints, street light failures, or pothole repairs",
    warningThresholdPercentage: 0.8,
  },
  LOW: {
    hours: 168, // 7 days / 168 hours
    label: "7 Days (Routine Administrative)",
    description: "General civic suggestions, routine maintenance requests, or non-urgent repairs",
    warningThresholdPercentage: 0.85,
  },
  PENDING_AI: {
    hours: 48,
    label: "48 Hours (Pending AI Triage)",
    description: "Initial intake default prior to priority determination",
    warningThresholdPercentage: 0.75,
  },
};

export const ESCALATION_TIERS: Record<
  EscalationLevel,
  {
    nextLevel: EscalationLevel | null;
    graceHoursBeforeNextTier: number;
    responsibleRole: string;
    description: string;
  }
> = {
  LEVEL_1_SUPERVISOR: {
    nextLevel: EscalationLevel.LEVEL_2_HOD,
    graceHoursBeforeNextTier: 24,
    responsibleRole: "SENIOR_OFFICER",
    description: "Escalated to Assistant Executive Engineer / Zonal Supervisor upon SLA target breach",
  },
  LEVEL_2_HOD: {
    nextLevel: EscalationLevel.LEVEL_3_DISTRICT_MAGISTRATE,
    graceHoursBeforeNextTier: 24,
    responsibleRole: "SENIOR_OFFICER",
    description: "Escalated to Department Head / Superintending Engineer after 24h of unaddressed breach",
  },
  LEVEL_3_DISTRICT_MAGISTRATE: {
    nextLevel: null,
    graceHoursBeforeNextTier: 0,
    responsibleRole: "ADMIN",
    description: "Final escalation to District Magistrate / Ministry Secretariat for regulatory intervention",
  },
};
