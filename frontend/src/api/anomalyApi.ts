import axiosClient from "./axiosClient";
import { ApiResponse } from "../types";

export type AnomalyStatus = "OPEN" | "INVESTIGATING" | "RESOLVED" | "FALSE_POSITIVE";
export type AnomalySeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AnomalyRecordItem {
  id: string;
  departmentId?: string | null;
  department?: { id: string; name: string; code: string } | null;
  locationPincode?: string | null;
  locationArea?: string | null;
  anomalyType: string;
  severity: AnomalySeverity;
  status: AnomalyStatus;
  baselineCount: number;
  currentCount: number;
  percentageIncrease: number;
  zScore?: number | null;
  description: string;
  investigationNotes?: string | null;
  detectedAt: string;
  resolvedAt?: string | null;
}

export interface AnomaliesResponseData {
  anomalies: AnomalyRecordItem[];
  metrics: {
    total: number;
    openCount: number;
    criticalCount: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const anomalyApi = {
  getAnomalies: async (params?: {
    status?: string;
    severity?: string;
    departmentId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<AnomaliesResponseData>> => {
    const response = await axiosClient.get<ApiResponse<AnomaliesResponseData>>("/anomalies", {
      params,
    });
    return response.data;
  },

  triggerScan: async (): Promise<ApiResponse<{ scannedClusters: number; anomaliesDetected: number; newAnomaliesSaved: number }>> => {
    const response = await axiosClient.post<ApiResponse<{ scannedClusters: number; anomaliesDetected: number; newAnomaliesSaved: number }>>("/anomalies/scan");
    return response.data;
  },

  updateStatus: async (
    id: string,
    status: AnomalyStatus,
    investigationNotes?: string
  ): Promise<ApiResponse<AnomalyRecordItem>> => {
    const response = await axiosClient.patch<ApiResponse<AnomalyRecordItem>>(
      `/anomalies/${id}/status`,
      { status, investigationNotes }
    );
    return response.data;
  },
};

export default anomalyApi;
