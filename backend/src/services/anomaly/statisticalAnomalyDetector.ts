import { IAnomalyDetector, AnomalyDetectionInput, AnomalyDetectionOutput } from "./anomaly.interface";
import { AnomalySeverity } from "@prisma/client";

export class StatisticalAnomalyDetector implements IAnomalyDetector {
  name = "StatisticalZScoreAndRollingAverage";

  async detect(input: AnomalyDetectionInput): Promise<AnomalyDetectionOutput> {
    const { historicalCounts, currentCount, departmentName, locationPincode } = input;

    // 1. Calculate Rolling Baseline Average (mu)
    const validHistory = historicalCounts.length > 0 ? historicalCounts : [15, 18, 20, 22];
    const sum = validHistory.reduce((acc, v) => acc + v, 0);
    const baseline = Math.round((sum / validHistory.length) * 10) / 10;

    // 2. Statistical Standard Deviation: max of sample std-dev and Poisson standard error (sqrt(baseline))
    const variance =
      validHistory.reduce((acc, v) => acc + Math.pow(v - baseline, 2), 0) / validHistory.length;
    const sampleStdDev = Math.sqrt(variance);
    const poissonStdDev = Math.sqrt(Math.max(baseline, 1));
    const stdDev = Math.max(sampleStdDev, poissonStdDev, 2.0);

    // 3. Compute Z-Score and Percentage Increase
    const zScore = Math.round(((currentCount - baseline) / stdDev) * 100) / 100;
    const percentageIncrease =
      Math.round(((currentCount - baseline) / Math.max(baseline, 1)) * 1000) / 10;

    // 4. Statistically Explainable Severity Classification
    let isAnomaly = false;
    let severity: AnomalySeverity = AnomalySeverity.LOW;
    let explanation = `Volume is within standard statistical variation (Baseline: ${baseline}/wk, Current: ${currentCount}).`;

    if (currentCount >= 20 && (percentageIncrease >= 250 || zScore >= 8.0)) {
      isAnomaly = true;
      severity = AnomalySeverity.CRITICAL;
      explanation = `CRITICAL SPIKE: ${currentCount} complaints detected in current window vs baseline ${baseline}/wk (+${percentageIncrease}%, Z-Score: ${zScore}σ). Immediate supervisor intervention required.`;
    } else if (currentCount >= 10 && (percentageIncrease >= 100 || zScore >= 3.5)) {
      isAnomaly = true;
      severity = AnomalySeverity.HIGH;
      explanation = `HIGH ABNORMAL SPIKE: ${currentCount} complaints received in ${departmentName || "Department"} at PIN ${locationPincode || "Area"} (+${percentageIncrease}% above rolling baseline ${baseline}/wk, ${zScore}σ).`;
    } else if (currentCount >= 6 && (percentageIncrease >= 50 || zScore >= 2.0)) {
      isAnomaly = true;
      severity = AnomalySeverity.MEDIUM;
      explanation = `MODERATE INFLOW: Grievance velocity elevated by ${percentageIncrease}% above baseline (+${zScore}σ).`;
    } else if (percentageIncrease >= 25 && currentCount >= 5) {
      isAnomaly = true;
      severity = AnomalySeverity.LOW;
      explanation = `MILD ELEVATION: Intake is ${percentageIncrease}% above baseline.`;
    }

    return {
      isAnomaly,
      anomalyType: "VOLUME_SPIKE",
      severity,
      baselineCount: baseline,
      currentCount,
      percentageIncrease,
      zScore,
      explanation,
    };
  }
}

export const statisticalAnomalyDetector = new StatisticalAnomalyDetector();
export default statisticalAnomalyDetector;
