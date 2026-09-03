import { StorageProvider } from "@prisma/client";
import { Readable } from "stream";

export interface UploadResult {
  fileKey: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  storageProvider: StorageProvider;
  fileSizeBytes: number;
  mimeType: string;
  folder: string;
}

export interface FileStreamResult {
  stream: Readable;
  mimeType: string;
  fileName: string;
  fileSizeBytes: number;
}

export interface IStorageService {
  uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    folder?: string
  ): Promise<UploadResult>;

  getFileStream(fileKey: string): Promise<FileStreamResult>;

  deleteFile(fileKey: string): Promise<boolean>;

  getFileUrl(fileKey: string): string;
}
