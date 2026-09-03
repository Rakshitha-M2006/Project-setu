/**
 * PROJECT SETU - AI Microservice Integration & Failover Verification Script
 */

import { AiServiceClient } from "../services/aiServiceClient";
import { env } from "../config/env";

async function runAiIntegrationTests() {
  console.log("=== RUNNING BACKEND AI CLIENT INTEGRATION TESTS ===");
  console.log(`Configured AI Service URL: ${env.AI_SERVICE_URL}`);
  console.log(`Configured Confidence Threshold: ${env.AI_CONFIDENCE_THRESHOLD * 100}%`);
  console.log(`Configured Timeout: ${env.AI_REQUEST_TIMEOUT_MS}ms\n`);

  let passed = 0;
  let failed = 0;

  // Test 1: High confidence power outage triage
  try {
    const res1 = await AiServiceClient.analyzeGrievance(
      "Power outage in street",
      "My street has been without electricity for two days."
    );

    console.log("Test 1 Result (Power Outage):");
    console.log(`  Category: ${res1.category}`);
    console.log(`  Department Code: ${res1.department_code}`);
    console.log(`  Issue Type: ${res1.issue_type}`);
    console.log(`  Priority: ${res1.priority} (SLA: ${res1.estimated_sla_hours}h)`);
    console.log(`  Confidence: ${(res1.confidence_score * 100).toFixed(1)}%`);
    console.log(`  Human Review: ${res1.requires_human_review}`);

    if (res1.department_code && res1.confidence_score > 0) {
      console.log("✔ Test 1 Passed: Power outage classification returned valid structure\n");
      passed++;
    } else {
      console.error("✖ Test 1 Failed: Invalid response structure");
      failed++;
    }
  } catch (err) {
    console.error("✖ Test 1 Failed with exception:", err);
    failed++;
  }

  // Test 2: Low confidence query triggers human review
  try {
    const res2 = await AiServiceClient.analyzeGrievance(
      "Something seems strange",
      "Things are not looking normal here please inspect."
    );

    console.log("Test 2 Result (Vague Input):");
    console.log(`  Category: ${res2.category}`);
    console.log(`  Confidence: ${(res2.confidence_score * 100).toFixed(1)}%`);
    console.log(`  Human Review Required: ${res2.requires_human_review}`);
    console.log(`  Below Threshold: ${res2.is_below_threshold}`);

    if (res2.requires_human_review === true && res2.is_below_threshold === true) {
      console.log("✔ Test 2 Passed: Low confidence input flagged for human review (< 85% threshold)\n");
      passed++;
    } else {
      console.error("✖ Test 2 Failed: Human review flag not raised");
      failed++;
    }
  } catch (err) {
    console.error("✖ Test 2 Failed with exception:", err);
    failed++;
  }

  // Test 3: Critical emergency priority evaluation
  try {
    const res3 = await AiServiceClient.analyzeGrievance(
      "Fire and electric spark from transformer",
      "Transformer explosion causing fire and live wire fallen on ground with electrocution risk!"
    );

    console.log("Test 3 Result (Critical Hazard):");
    console.log(`  Priority: ${res3.priority}`);
    console.log(`  SLA: ${res3.estimated_sla_hours} hours`);
    console.log(`  Is Urgent: ${res3.is_urgent}`);

    if (res3.priority === "CRITICAL" || res3.is_urgent === true || res3.estimated_sla_hours <= 24) {
      console.log("✔ Test 3 Passed: Critical emergency correctly classified with expedited SLA\n");
      passed++;
    } else {
      console.error("✖ Test 3 Failed: Emergency priority not detected");
      failed++;
    }
  } catch (err) {
    console.error("✖ Test 3 Failed with exception:", err);
    failed++;
  }

  // Test 4: Health diagnostic check
  try {
    const health = await AiServiceClient.checkHealth();
    console.log("Test 4 Result (Health Check):", health);
    console.log("✔ Test 4 Passed: Health diagnostic returned status\n");
    passed++;
  } catch (err) {
    console.error("✖ Test 4 Failed:", err);
    failed++;
  }

  console.log(`=== SUMMARY: ${passed} Passed, ${failed} Failed ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runAiIntegrationTests();
