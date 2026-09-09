/**
 * PROJECT SETU — Dynamic Localization Utilities
 * Localizes Department names, Notification titles/messages, and civic entities across all 12 supported languages.
 */

// Department name / code mappings
const DEPT_MAP: Record<string, string> = {
  // Codes
  WATER_SUPPLY: "WATER_SUPPLY",
  WTR: "WATER_SUPPLY",
  ELECTRICITY: "ELECTRICITY",
  ELC: "ELECTRICITY",
  ROADS_HIGHWAYS: "ROADS_HIGHWAYS",
  PWD: "ROADS_HIGHWAYS",
  HEALTH_SANITATION: "HEALTH_SANITATION",
  HLT: "HEALTH_SANITATION",
  REVENUE_LAND: "REVENUE_LAND",
  REV: "REVENUE_LAND",
  WOMEN_CHILD: "WOMEN_CHILD",
  WCD: "WOMEN_CHILD",
  GENERAL_ADMINISTRATION: "GENERAL_ADMINISTRATION",
  GEN: "GENERAL_ADMINISTRATION",
  MNC: "REVENUE_LAND",

  // English Names
  "department of water supply & sewerage": "WATER_SUPPLY",
  "water supply & sewerage": "WATER_SUPPLY",
  "water supply": "WATER_SUPPLY",
  "electricity & power distribution department": "ELECTRICITY",
  "electricity department": "ELECTRICITY",
  "public works department (pwd) - roads & infrastructure": "ROADS_HIGHWAYS",
  "public works department": "ROADS_HIGHWAYS",
  "roads & infrastructure": "ROADS_HIGHWAYS",
  "department of health, medical & family welfare": "HEALTH_SANITATION",
  "health & sanitation": "HEALTH_SANITATION",
  "department of revenue & land administration": "REVENUE_LAND",
  "revenue & land administration": "REVENUE_LAND",
  "department of women & child development": "WOMEN_CHILD",
  "women & child development": "WOMEN_CHILD",
  "general administration & citizen grievance cell": "GENERAL_ADMINISTRATION",
  "general administration": "GENERAL_ADMINISTRATION",
  "general": "GENERAL_ADMINISTRATION",

  // Triage States
  "pending human review": "pendingTriage",
  "pending triage": "pendingTriage",
  "ai triaging": "aiTriaging",
  "ai routing...": "aiRouting",
  "ai routing": "aiRouting",
  "unassigned": "pendingTriage",
};

export function getLocalizedDepartmentName(
  dept: { code?: string; name?: string } | string | undefined | null,
  t: (key: string, params?: any) => string
): string {
  if (!dept) return t("departments.GENERAL_ADMINISTRATION") || "General Administration";

  let keyToLookup = "";
  let rawName = "";

  if (typeof dept === "string") {
    rawName = dept.trim();
    keyToLookup = rawName.toLowerCase();
  } else {
    rawName = dept.name || dept.code || "";
    if (dept.code && DEPT_MAP[dept.code.toUpperCase()]) {
      const codeKey = DEPT_MAP[dept.code.toUpperCase()];
      const translated = t(`departments.${codeKey}`);
      if (translated && !translated.startsWith("departments.")) return translated;
    }
    keyToLookup = (dept.name || dept.code || "").trim().toLowerCase();
  }

  const mappedKey = DEPT_MAP[keyToLookup];
  if (mappedKey) {
    const translated = t(`departments.${mappedKey}`);
    if (translated && !translated.startsWith("departments.")) return translated;
  }

  return rawName;
}

export function getLocalizedStatus(
  status: string | undefined | null,
  t: (key: string, params?: any) => string
): string {
  if (!status) return "";
  const trimmed = status.trim();
  const normalizedKey = trimmed.toLowerCase().replace(/\s+/g, "_");

  // 1. Direct match in status root (e.g., status.resolved, status.in_progress)
  const fromStatus = t(`status.${normalizedKey}`);
  if (fromStatus && !fromStatus.startsWith("status.")) return fromStatus;

  // 2. Direct match in grievanceStatus (e.g., grievanceStatus.resolved)
  const fromGrievance = t(`grievanceStatus.${normalizedKey}`);
  if (fromGrievance && !fromGrievance.startsWith("grievanceStatus.")) return fromGrievance;

  // 3. Match camelCase grievanceStatus (e.g., grievanceStatus.grievanceResolved, grievanceActionInProgress)
  const grievanceCamel = "grievance" + normalizedKey.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("");
  const fromGrievanceCamel = t(`grievanceStatus.${grievanceCamel}`);
  if (fromGrievanceCamel && !fromGrievanceCamel.startsWith("grievanceStatus.")) return fromGrievanceCamel;

  // 4. Special cases
  if (normalizedKey === "in_progress") {
    const act = t("grievanceStatus.grievanceActionInProgress");
    if (act && !act.startsWith("grievanceStatus.")) return act;
  }
  if (normalizedKey === "assigned" || normalizedKey === "department_assigned") {
    const deptAssigned = t("grievanceStatus.grievanceAssigned");
    if (deptAssigned && !deptAssigned.startsWith("grievanceStatus.")) return deptAssigned;
  }

  // 5. Match common.statusCamelCase (e.g. common.statusResolved, common.statusInProgress)
  const commonCamel = "status" + normalizedKey.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("");
  const fromCommon = t(`common.${commonCamel}`);
  if (fromCommon && !fromCommon.startsWith("common.")) return fromCommon;

  return trimmed;
}

export function localizeNotification(
  n: { title: string; message: string; type?: string },
  t: (key: string, params?: any) => string
): { title: string; message: string } {
  let localizedTitle = n.title;
  let localizedMessage = n.message;

  // 1. Localize Title
  const titleTrimmed = n.title.trim();
  if (/^(?:Grievance Lodged|Grievance Registered):\s*(SETU-[A-Z0-9-]+)/i.test(titleTrimmed)) {
    const match = titleTrimmed.match(/^(?:Grievance Lodged|Grievance Registered):\s*(SETU-[A-Z0-9-]+)/i);
    const prefix = t("notifications.types.grievanceLodged") || "Grievance Lodged";
    localizedTitle = `${prefix}: ${match![1]}`;
  } else if (/^Grievance Status:\s*([A-Z_ ]+)/i.test(titleTrimmed)) {
    const match = titleTrimmed.match(/^Grievance Status:\s*([A-Z_ ]+)/i);
    const statusLabel = getLocalizedStatus(match![1], t);
    const prefix = t("notifications.types.grievanceStatus") || "Grievance Status";
    localizedTitle = `${prefix}: ${statusLabel}`;
  } else if (/^Grievance Resolved:\s*(SETU-[A-Z0-9-]+)/i.test(titleTrimmed)) {
    const match = titleTrimmed.match(/^Grievance Resolved:\s*(SETU-[A-Z0-9-]+)/i);
    const prefix = getLocalizedStatus("RESOLVED", t) || "Resolved";
    localizedTitle = `${prefix}: ${match![1]}`;
  } else if (/^(?:Field\s+)?Officer Assigned:\s*(SETU-[A-Z0-9-]+)/i.test(titleTrimmed)) {
    const match = titleTrimmed.match(/^(?:Field\s+)?Officer Assigned:\s*(SETU-[A-Z0-9-]+)/i);
    const prefix = t("notifications.types.officerAssigned") || "Officer Assigned";
    localizedTitle = `${prefix}: ${match![1]}`;
  } else if (/^New (?:Case|Grievance) Assigned:\s*(SETU-[A-Z0-9-]+)/i.test(titleTrimmed)) {
    const match = titleTrimmed.match(/^New (?:Case|Grievance) Assigned:\s*(SETU-[A-Z0-9-]+)/i);
    const prefix = t("notifications.types.newGrievanceAssigned") || "New Case Assigned";
    localizedTitle = `${prefix}: ${match![1]}`;
  } else if (/^Department Assigned:\s*(SETU-[A-Z0-9-]+)/i.test(titleTrimmed)) {
    const match = titleTrimmed.match(/^Department Assigned:\s*(SETU-[A-Z0-9-]+)/i);
    const prefix = t("notifications.types.departmentAssigned") || "Department Assigned";
    localizedTitle = `${prefix}: ${match![1]}`;
  } else if (/^AI Triage Complete:\s*(SETU-[A-Z0-9-]+)/i.test(titleTrimmed)) {
    const match = titleTrimmed.match(/^AI Triage Complete:\s*(SETU-[A-Z0-9-]+)/i);
    const prefix = t("notifications.types.aiTriageComplete") || "AI Triage Complete";
    localizedTitle = `${prefix}: ${match![1]}`;
  } else if (/^(?:⚠️\s*SLA Warning|🚨\s*SLA Breached|Grievance Escalated):\s*(SETU-[A-Z0-9-]+)/i.test(titleTrimmed)) {
    const match = titleTrimmed.match(/^(?:⚠️\s*SLA Warning|🚨\s*SLA Breached|Grievance Escalated):\s*(SETU-[A-Z0-9-]+)/i);
    const prefix = t("notifications.types.slaBreached") || "SLA Escalation";
    localizedTitle = `${prefix}: ${match![1]}`;
  }

  // 2. Localize Message
  const msgTrimmed = n.message.trim();

  // Pattern 1: Grievance Lodged / Registered (full triage routing)
  const regPattern = /Your grievance '?(.*?)'? has been registered under reference (SETU-[A-Z0-9-]+)\.\s*Routed to:\s*(.*?),\s*Priority:\s*([A-Z]+),\s*Target SLA:\s*(\d+)\s*hrs\./i;
  const regMatch = msgTrimmed.match(regPattern);
  if (regMatch) {
    const [, gTitle, ref, deptName, priority, sla] = regMatch;
    const priLabel = t(`priority.${priority.toLowerCase()}`) || priority;
    const deptLabel = getLocalizedDepartmentName(deptName, t);
    localizedMessage = t("notifications.templates.grievanceRegistered", {
      title: gTitle,
      ref,
      dept: deptLabel,
      priority: priLabel,
      sla
    });
    return { title: localizedTitle, message: localizedMessage };
  }

  // Pattern 2: Grievance Status with Remarks
  const statusRemarksPattern = /Your grievance (SETU-[A-Z0-9-]+) has been updated to ([A-Z_ ]+?)\.\s*Remarks:\s*(.*)/i;
  const statusRemarksMatch = msgTrimmed.match(statusRemarksPattern);
  if (statusRemarksMatch) {
    const [, ref, status, remarks] = statusRemarksMatch;
    const statusLabel = getLocalizedStatus(status, t);
    localizedMessage = t("notifications.templates.statusUpdated", {
      ref,
      status: statusLabel,
      remarks
    });
    return { title: localizedTitle, message: localizedMessage };
  }

  // Pattern 3: Grievance Status without Remarks
  const statusNoRemarksPattern = /Your grievance (SETU-[A-Z0-9-]+) has been updated to ([A-Z_ ]+?)\.?$/i;
  const statusNoRemarksMatch = msgTrimmed.match(statusNoRemarksPattern);
  if (statusNoRemarksMatch) {
    const [, ref, status] = statusNoRemarksMatch;
    const statusLabel = getLocalizedStatus(status, t);
    localizedMessage = t("notifications.templates.statusUpdatedNoRemarks", {
      ref,
      status: statusLabel
    });
    return { title: localizedTitle, message: localizedMessage };
  }

  // Pattern 4: Grievance Resolved Summary
  const resolvedSummaryPattern = /Your grievance (SETU-[A-Z0-9-]+) has been resolved by the department\.\s*Resolution Summary:\s*"?([^"]*)"?\.?\s*Please provide your rating and feedback\.?/i;
  const resolvedSummaryMatch = msgTrimmed.match(resolvedSummaryPattern);
  if (resolvedSummaryMatch) {
    const [, ref, summary] = resolvedSummaryMatch;
    const statusLabel = getLocalizedStatus("RESOLVED", t);
    localizedMessage = t("notifications.templates.statusUpdated", {
      ref,
      status: statusLabel,
      remarks: summary
    });
    return { title: localizedTitle, message: localizedMessage };
  }

  // Pattern 5: Officer Assigned
  const officerPattern1 = /(?:Field\s+)?Officer (.*?) \((.*?)\) has been assigned to your grievance and is actively investigating\./i;
  const officerMatch1 = msgTrimmed.match(officerPattern1);
  if (officerMatch1) {
    const [, name, designation] = officerMatch1;
    localizedMessage = t("notifications.templates.officerAssigned", {
      name,
      designation
    });
    return { title: localizedTitle, message: localizedMessage };
  }

  const officerPattern2 = /(?:Field\s+)?Officer (.*?) \((.*?)\) has claimed your grievance and initiated on-site technical inspection\./i;
  const officerMatch2 = msgTrimmed.match(officerPattern2);
  if (officerMatch2) {
    const [, name, designation] = officerMatch2;
    localizedMessage = t("notifications.templates.officerClaimed", {
      name,
      designation
    });
    return { title: localizedTitle, message: localizedMessage };
  }

  // Pattern 6: Department Allocated
  const deptAllocPattern = /Your complaint (SETU-[A-Z0-9-]+) has been officially allocated to the (.*?) for field investigation and resolution\./i;
  const deptAllocMatch = msgTrimmed.match(deptAllocPattern);
  if (deptAllocMatch) {
    const [, ref, deptName] = deptAllocMatch;
    const deptLabel = getLocalizedDepartmentName(deptName, t);
    localizedMessage = t("notifications.templates.departmentAssigned", {
      ref,
      dept: deptLabel
    });
    return { title: localizedTitle, message: localizedMessage };
  }

  // Pattern 7: Application Submitted
  const appSubPattern = /Your application for '?(.*?)'? (?:has been successfully submitted|has been received) under (?:reference|acknowledgement) ([A-Z0-9-]+)\./i;
  const appSubMatch = msgTrimmed.match(appSubPattern);
  if (appSubMatch) {
    const [, serviceName, appRef] = appSubMatch;
    localizedMessage = t("notifications.templates.applicationSubmitted", {
      service: serviceName,
      ref: appRef
    });
    return { title: localizedTitle, message: localizedMessage };
  }

  // Pattern 8: Application Status Changed
  const appStatusPattern = /Your application for '?(.*?)'? status has changed to ([A-Z_ ]+?)\.\s*Remarks:\s*(.*)/i;
  const appStatusMatch = msgTrimmed.match(appStatusPattern);
  if (appStatusMatch) {
    const [, serviceName, appStatus, remarks] = appStatusMatch;
    const statusLabel = getLocalizedStatus(appStatus, t);
    localizedMessage = t("notifications.templates.applicationUpdated", {
      ref: serviceName,
      status: statusLabel,
      remarks
    });
    return { title: localizedTitle, message: localizedMessage };
  }

  return { title: localizedTitle, message: localizedMessage };
}
