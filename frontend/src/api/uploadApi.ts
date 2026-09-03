import axiosClient from "./axiosClient";
import { ApiResponse } from "../types";

export interface UploadedFileResult {
  id?: string;
  fileKey: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
  folder?: string;
  isResolutionEvidence?: boolean;
}

export const uploadApi = {
  /**
   * Staging upload for forms prior to entity creation
   */
  uploadGeneralFile: async (
    file: File,
    onProgress?: (progressPercent: number) => void
  ): Promise<ApiResponse<UploadedFileResult>> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosClient.post<ApiResponse<UploadedFileResult>>(
      "/uploads/general",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      }
    );

    return response.data;
  },

  /**
   * Upload attachment directly to a grievance record
   */
  uploadGrievanceAttachment: async (
    grievanceId: string,
    file: File,
    onProgress?: (progressPercent: number) => void
  ): Promise<ApiResponse<UploadedFileResult>> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosClient.post<ApiResponse<UploadedFileResult>>(
      `/uploads/grievance/${grievanceId}/attachment`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      }
    );

    return response.data;
  },

  /**
   * Field Officer attaches verified resolution evidence / site repair photo
   */
  uploadOfficerEvidence: async (
    grievanceId: string,
    file: File,
    onProgress?: (progressPercent: number) => void
  ): Promise<ApiResponse<UploadedFileResult>> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosClient.post<ApiResponse<UploadedFileResult>>(
      `/uploads/officer/grievance/${grievanceId}/evidence`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      }
    );

    return response.data;
  },

  /**
   * Upload supporting document scan for a service application
   */
  uploadApplicationDocument: async (
    applicationId: string,
    file: File,
    documentType: string,
    onProgress?: (progressPercent: number) => void
  ): Promise<ApiResponse<UploadedFileResult>> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentType);

    const response = await axiosClient.post<ApiResponse<UploadedFileResult>>(
      `/uploads/application/${applicationId}/document`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      }
    );

    return response.data;
  },

  /**
   * Delete attachment record and storage object
   */
  deleteAttachment: async (attachmentId: string): Promise<ApiResponse<any>> => {
    const response = await axiosClient.delete<ApiResponse<any>>(
      `/uploads/attachments/${attachmentId}`
    );
    return response.data;
  },
};

export default uploadApi;
