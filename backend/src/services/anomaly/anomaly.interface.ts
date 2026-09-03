import { AnomalySeverity, AnomalyStatus } from "@prisma/client";

export interface AnomalyDetectionInput {
  departmentId?: string;
  departmentName?: string;
  locationPincode?: string;
  locationArea?: string;
  historicalCounts: number[]; // e.g. [18, 22, 19, 21, 20] weekly counts
  currentCount: number;       // e.g. 150 complaints in current window
}

export interface AnomalyDetectionOutput {
  isAnomaly: boolean;
  anomalyType: string;
  severity: AnomalySeverity;
  baselineCount: number;
  currentCount: number;
  percentageIncrease: number;
  zScore: number;
  explanation: string;
}

export interface IAnomalyDetector {
  name: string;
  detect(input: AnomalyDetectionInput): Promise<AnomalyDetectionOutput>;
}
