/**
 * PROJECT SETU — Statistical Anomaly Detection & Surge Surveillance Test Suite
 */

import { statisticalAnomalyDetector } from "../services/anomaly/statisticalAnomalyDetector";
import { AnomalySeverity } from "@prisma/client";

async function runAnomalyTests() {
  console.log("==================================================================");
  console.log("🚀 TESTING STATISTICAL ANOMALY DETECTION ENGINE");
  console.log("==================================================================\n");

  let passed = 0;
  let failed = 0;

  // ----------------------------------------------------------------------------
  // Test Case 1: Massive Incident Spike (e.g. Water Dept 20/wk -> 150/wk)
  // ----------------------------------------------------------------------------
  console.log("--- Test Case 1: Massive Volume Spike (20 -> 150) ---");
  const waterSpike = await statisticalAnomalyDetector.detect({
    departmentName: "Department of Water Supply & Sewerage",
    locationPincode: "110001",
    historicalCounts: [18, 22, 19, 21], // avg = 20.0
    currentCount: 150,
  });

  console.log("  Spike Output:", {
    isAnomaly: waterSpike.isAnomaly,
    severity: waterSpike.severity,
    baseline: waterSpike.baselineCount,
    current: waterSpike.currentCount,
    percentageIncrease: `+${waterSpike.percentageIncrease}%`,
    zScore: `${waterSpike.zScore}σ`,
    explanation: waterSpike.explanation,
  });

  if (
    waterSpike.isAnomaly &&
    waterSpike.severity === AnomalySeverity.CRITICAL &&
    waterSpike.baselineCount === 20 &&
    waterSpike.percentageIncrease === 650 &&
    waterSpike.zScore >= 4.0
  ) {
    console.log("✔ Test 1 Passed: Extreme spike correctly flagged as CRITICAL (+650%, Z-score > 4σ)\n");
    passed++;
  } else {
    console.error("✖ Test 1 Failed: Anomaly detection calculation mismatch", waterSpike);
    failed++;
  }

  // ----------------------------------------------------------------------------
  // Test Case 2: Standard Baseline Fluctuation (20 -> 22)
  // ----------------------------------------------------------------------------
  console.log("--- Test Case 2: Normal Baseline Fluctuation (20 -> 22) ---");
  const normalIntake = await statisticalAnomalyDetector.detect({
    departmentName: "Electricity Department",
    locationPincode: "110002",
    historicalCounts: [18, 22, 19, 21],
    currentCount: 22,
  });

  console.log("  Normal Output:", {
    isAnomaly: normalIntake.isAnomaly,
    severity: normalIntake.severity,
    percentageIncrease: `+${normalIntake.percentageIncrease}%`,
  });

  if (!normalIntake.isAnomaly || normalIntake.severity === AnomalySeverity.LOW) {
    console.log("✔ Test 2 Passed: Normal variance within ±10% correctly recognized as normal\n");
    passed++;
  } else {
    console.error("✖ Test 2 Failed: Normal variance falsely flagged as high anomaly");
    failed++;
  }

  // ----------------------------------------------------------------------------
  // Test Case 3: Moderate Elevated Surge (20 -> 45)
  // ----------------------------------------------------------------------------
  console.log("--- Test Case 3: Moderate Elevated Surge (20 -> 45) ---");
  const moderateSpike = await statisticalAnomalyDetector.detect({
    departmentName: "Public Works Department (PWD)",
    locationPincode: "110005",
    historicalCounts: [20, 20, 20, 20],
    currentCount: 45,
  });

  console.log("  Moderate Output:", {
    isAnomaly: moderateSpike.isAnomaly,
    severity: moderateSpike.severity,
    percentageIncrease: `+${moderateSpike.percentageIncrease}%`,
    zScore: `${moderateSpike.zScore}σ`,
  });

  if (
    moderateSpike.isAnomaly &&
    (moderateSpike.severity === AnomalySeverity.HIGH || moderateSpike.severity === AnomalySeverity.MEDIUM) &&
    moderateSpike.percentageIncrease === 125
  ) {
    console.log("✔ Test 3 Passed: Moderate elevation correctly classified with explainable stats\n");
    passed++;
  } else {
    console.error("✖ Test 3 Failed: Unexpected moderate surge classification", moderateSpike);
    failed++;
  }

  console.log("==================================================================");
  console.log(`✨ RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runAnomalyTests();
