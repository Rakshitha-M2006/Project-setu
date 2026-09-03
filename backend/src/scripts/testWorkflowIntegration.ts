/**
 * PROJECT SETU - AI Grievance Workflow & Automatic Routing Verification Script
 */

import { GrievanceWorkflowService } from "../services/grievanceWorkflowService";
import { env } from "../config/env";
import { GrievanceStatus, Priority } from "@prisma/client";

async function testWorkflowFlow() {
  console.log("==================================================================");
  console.log("🚀 TESTING AI WORKFLOW & AUTOMATIC DEPARTMENT ROUTING");
  console.log(`Configured AI Confidence Threshold: ${env.AI_CONFIDENCE_THRESHOLD * 100}%`);
  console.log("==================================================================\n");

  let passed = 0;
  let failed = 0;

  // ----------------------------------------------------------------------------
  // Test 1: High Confidence Electricity Grievance (Automatic Routing Flow)
  // ----------------------------------------------------------------------------
  try {
    console.log("--- Test Case 1: Electricity Blackout (Auto-Route Expected) ---");
    const ai1 = await GrievanceWorkflowService.classifyGrievance(
      "Power outage in street",
      "My street has been without electricity for two days."
    );

    console.log(`  AI Classification -> Dept: ${ai1.department_code}, Conf: ${(ai1.confidence_score * 100).toFixed(1)}%, Issue: ${ai1.issue_type}`);
    const routing1 = await GrievanceWorkflowService.routeGrievance(ai1);
    const priority1 = GrievanceWorkflowService.calculatePriority(ai1);
    const history1 = GrievanceWorkflowService.getLifecycleHistoryEntries("dummy-citizen-id", routing1, ai1, priority1);

    console.log(`  Routing Decision -> Can Auto-Route: ${routing1.canAutoRoute}, Target Status: ${routing1.targetStatus}`);
    console.log(`  Priority Result  -> Priority: ${priority1.priority}, SLA: ${priority1.slaHours} hours`);
    console.log("  Lifecycle Audit Trail:");
    history1.forEach((h, idx) => {
      console.log(`    Step ${idx + 1}: [${h.newStatus}] ${h.actionTaken} - ${h.remarks}`);
    });

    if (
      routing1.canAutoRoute === true &&
      routing1.targetStatus === GrievanceStatus.OFFICER_PENDING &&
      history1.length === 4 &&
      history1[0].newStatus === GrievanceStatus.SUBMITTED &&
      history1[1].newStatus === GrievanceStatus.AI_CLASSIFIED &&
      history1[2].newStatus === GrievanceStatus.DEPARTMENT_ASSIGNED &&
      history1[3].newStatus === GrievanceStatus.OFFICER_PENDING
    ) {
      console.log("✔ Test 1 Passed: Full auto-routing lifecycle verified (SUBMITTED -> AI_CLASSIFIED -> DEPARTMENT_ASSIGNED -> OFFICER_PENDING)\n");
      passed++;
    } else {
      console.error("✖ Test 1 Failed: Lifecycle mismatch", { routing1, history1 });
      failed++;
    }
  } catch (err) {
    console.error("✖ Test 1 Failed with error:", err);
    failed++;
  }

  // ----------------------------------------------------------------------------
  // Test 2: Low Confidence Ambiguous Grievance (Human Review Flow)
  // ----------------------------------------------------------------------------
  try {
    console.log("--- Test Case 2: Vague Grievance (Human Review Expected) ---");
    const ai2 = await GrievanceWorkflowService.classifyGrievance(
      "Something seems strange",
      "Things are not looking normal in my neighborhood please check."
    );

    console.log(`  AI Classification -> Dept: ${ai2.department_code}, Conf: ${(ai2.confidence_score * 100).toFixed(1)}%`);
    const routing2 = await GrievanceWorkflowService.routeGrievance(ai2);
    const priority2 = GrievanceWorkflowService.calculatePriority(ai2);
    const history2 = GrievanceWorkflowService.getLifecycleHistoryEntries("dummy-citizen-id", routing2, ai2, priority2);

    console.log(`  Routing Decision -> Can Auto-Route: ${routing2.canAutoRoute}, Requires Human Review: ${routing2.requiresHumanReview}`);
    console.log(`  Target Status    -> ${routing2.targetStatus}`);
    console.log("  Lifecycle Audit Trail:");
    history2.forEach((h, idx) => {
      console.log(`    Step ${idx + 1}: [${h.newStatus}] ${h.actionTaken} - ${h.remarks}`);
    });

    if (
      routing2.canAutoRoute === false &&
      routing2.requiresHumanReview === true &&
      routing2.targetStatus === GrievanceStatus.AI_REVIEW_REQUIRED &&
      history2.some((h) => h.newStatus === GrievanceStatus.AI_REVIEW_REQUIRED)
    ) {
      console.log("✔ Test 2 Passed: Low confidence input flagged for human review (SUBMITTED -> AI_REVIEW_REQUIRED)\n");
      passed++;
    } else {
      console.error("✖ Test 2 Failed: Review trigger mismatch", { routing2, history2 });
      failed++;
    }
  } catch (err) {
    console.error("✖ Test 2 Failed with error:", err);
    failed++;
  }

  // ----------------------------------------------------------------------------
  // Test 3: Critical Water Hazard (Expedited SLA calculation)
  // ----------------------------------------------------------------------------
  try {
    console.log("--- Test Case 3: Water Contamination Hazard (Critical SLA) ---");
    const ai3 = await GrievanceWorkflowService.classifyGrievance(
      "Severe drinking water contamination",
      "Drinking water smells of chlorine and pipeline is leaking brown sludge near main tank."
    );

    const priority3 = GrievanceWorkflowService.calculatePriority(ai3);
    console.log(`  Priority: ${priority3.priority}, SLA: ${priority3.slaHours} hours, Urgent: ${priority3.isUrgent}`);

    if (priority3.priority === Priority.CRITICAL && priority3.slaHours <= 12 && priority3.isUrgent === true) {
      console.log("✔ Test 3 Passed: Critical public health hazard assigned expedited SLA\n");
      passed++;
    } else {
      console.error("✖ Test 3 Failed: Critical priority not detected", priority3);
      failed++;
    }
  } catch (err) {
    console.error("✖ Test 3 Failed with error:", err);
    failed++;
  }

  console.log("==================================================================");
  console.log(`✨ RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

testWorkflowFlow();
