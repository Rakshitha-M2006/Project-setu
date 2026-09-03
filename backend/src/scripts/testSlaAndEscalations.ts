/**
 * PROJECT SETU — SLA Management & Tiered Escalation Unit / Integration Test
 */

import { SlaService } from "../services/slaService";
import { SLA_CONFIG, ESCALATION_TIERS } from "../config/slaConfig";
import { Priority, GrievanceStatus, EscalationLevel, EscalationStatus } from "@prisma/client";

async function runSlaTests() {
  console.log("==================================================================");
  console.log("🚀 TESTING GRIEVANCE SLA MANAGEMENT & TIERED ESCALATIONS");
  console.log("==================================================================\n");

  let passed = 0;
  let failed = 0;

  // ----------------------------------------------------------------------------
  // Test 1: Configurable SLA Deadline Calculation
  // ----------------------------------------------------------------------------
  console.log("--- Test Case 1: Configurable Priority SLA Calculation ---");
  const testPriorities: Array<{ priority: Priority; expectedHours: number }> = [
    { priority: Priority.CRITICAL, expectedHours: 24 },
    { priority: Priority.HIGH, expectedHours: 48 },
    { priority: Priority.MEDIUM, expectedHours: 72 },
    { priority: Priority.LOW, expectedHours: 168 },
  ];

  let priorityCheckPassed = true;
  for (const { priority, expectedHours } of testPriorities) {
    const res = await SlaService.calculateDeadline(priority);
    console.log(`  ${priority} -> Calculated: ${res.slaHours} hours (Expected: ${expectedHours}h)`);
    if (res.slaHours !== expectedHours) {
      priorityCheckPassed = false;
    }
  }

  if (priorityCheckPassed) {
    console.log("✔ Test 1 Passed: All Priority SLA Turnaround Deadlines match configurable master specs\n");
    passed++;
  } else {
    console.error("✖ Test 1 Failed: SLA deadline hours did not match configuration");
    failed++;
  }

  // ----------------------------------------------------------------------------
  // Test 2: Live SLA Real-time Status Evaluation
  // ----------------------------------------------------------------------------
  console.log("--- Test Case 2: Live SLA Status & Progress Calculation ---");
  const now = new Date();
  const created2HoursAgo = new Date(now.getTime() - 2 * 3600 * 1000);
  const deadline22HoursLater = new Date(now.getTime() + 22 * 3600 * 1000);

  const slaActive = SlaService.getGrievanceSlaStatus({
    createdAt: created2HoursAgo,
    slaDeadline: deadline22HoursLater,
    status: GrievanceStatus.IN_PROGRESS,
    priority: Priority.CRITICAL,
  });

  console.log("  Active Case Metrics:", {
    totalHours: slaActive.totalHours,
    remainingHours: slaActive.remainingHours,
    isBreached: slaActive.isBreached,
    slaState: slaActive.slaState,
    citizenStatus: slaActive.citizenFriendlyStatus,
  });

  if (
    slaActive.slaState === "ON_TRACK" &&
    !slaActive.isBreached &&
    slaActive.remainingHours > 20 &&
    typeof slaActive.citizenFriendlyStatus === "string"
  ) {
    console.log("✔ Test 2 Passed: Real-time SLA progress, remaining hours, and citizen-friendly status calculated\n");
    passed++;
  } else {
    console.error("✖ Test 2 Failed: Active SLA status calculation incorrect", slaActive);
    failed++;
  }

  // ----------------------------------------------------------------------------
  // Test 3: Overdue Grievance Detection & Breach Flagging
  // ----------------------------------------------------------------------------
  console.log("--- Test Case 3: Overdue Grievance Detection ---");
  const created3DaysAgo = new Date(now.getTime() - 72 * 3600 * 1000);
  const deadline1DayAgo = new Date(now.getTime() - 24 * 3600 * 1000);

  const slaOverdue = SlaService.getGrievanceSlaStatus({
    createdAt: created3DaysAgo,
    slaDeadline: deadline1DayAgo,
    status: GrievanceStatus.IN_PROGRESS,
    priority: Priority.HIGH,
    escalations: [{ escalationLevel: EscalationLevel.LEVEL_1_SUPERVISOR, status: EscalationStatus.TRIGGERED }],
  });

  console.log("  Overdue Case Metrics:", {
    isBreached: slaOverdue.isBreached,
    slaState: slaOverdue.slaState,
    currentEscalationLevel: slaOverdue.currentEscalationLevel,
    citizenStatus: slaOverdue.citizenFriendlyStatus,
  });

  if (
    slaOverdue.isBreached === true &&
    slaOverdue.slaState === "BREACHED" &&
    slaOverdue.currentEscalationLevel === EscalationLevel.LEVEL_1_SUPERVISOR
  ) {
    console.log("✔ Test 3 Passed: Overdue complaint flagged and Level 1 supervisor escalation mapped\n");
    passed++;
  } else {
    console.error("✖ Test 3 Failed: Overdue detection mismatch", slaOverdue);
    failed++;
  }

  // ----------------------------------------------------------------------------
  // Test 4: Tiered Escalation Hierarchy Verification
  // ----------------------------------------------------------------------------
  console.log("--- Test Case 4: Multi-Tier Escalation Hierarchy ---");
  console.log("  Level 1 (Supervisor): Next ->", ESCALATION_TIERS.LEVEL_1_SUPERVISOR.nextLevel);
  console.log("  Level 2 (HOD): Next ->", ESCALATION_TIERS.LEVEL_2_HOD.nextLevel);
  console.log("  Level 3 (DM / Admin): Final Tier ->", ESCALATION_TIERS.LEVEL_3_DISTRICT_MAGISTRATE.responsibleRole);

  if (
    ESCALATION_TIERS.LEVEL_1_SUPERVISOR.nextLevel === EscalationLevel.LEVEL_2_HOD &&
    ESCALATION_TIERS.LEVEL_2_HOD.nextLevel === EscalationLevel.LEVEL_3_DISTRICT_MAGISTRATE &&
    ESCALATION_TIERS.LEVEL_3_DISTRICT_MAGISTRATE.responsibleRole === "ADMIN"
  ) {
    console.log("✔ Test 4 Passed: 3-Tier Escalation path verified (Supervisor -> HOD -> District Magistrate / Admin)\n");
    passed++;
  } else {
    console.error("✖ Test 4 Failed: Escalation hierarchy inconsistent");
    failed++;
  }

  console.log("==================================================================");
  console.log(`✨ RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runSlaTests();
