import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Readable } from "stream";
import { IStorageService, UploadResult, FileStreamResult } from "./storage.interface";
import { StorageProvider } from "@prisma/client";
import { logger } from "../../utils/logger";
import { ApiError } from "../../utils/apiError";

// Deterministic mapping from validated MIME type to safe extension
const MIME_EXTENSION_MAP: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export class LocalStorageService implements IStorageService {
  private baseStorageDir: string;
  private baseUrl: string;

  constructor(customStorageDir?: string) {
    // Root upload directory (safe isolated path)
    this.baseStorageDir = customStorageDir || path.resolve(process.cwd(), "uploads");
    this.baseUrl = process.env.API_BASE_URL || "/api/v1/uploads/files";

    // Ensure base upload directory exists
    if (!fs.existsSync(this.baseStorageDir)) {
      fs.mkdirSync(this.baseStorageDir, { recursive: true });
      logger.info(`[Storage] Initialized secure local storage directory at: ${this.baseStorageDir}`);
    }
  }

  /**
   * Sanitizes folder name and validates against directory traversal
   */
  private sanitizeFolder(folder: string): string {
    const sanitized = folder.replace(/[^a-zA-Z0-9_-]/g, "");
    return sanitized || "documents";
  }

  /**
   * Generates a cryptographically random, collision-resistant filename with safe extension
   */
  private generateSafeFileName(originalName: string, mimeType: string): { fileName: string; extension: string } {
    const extension = MIME_EXTENSION_MAP[mimeType.toLowerCase()] || ".bin";
    const randomHex = crypto.randomBytes(16).toString("hex");
    const timestamp = Date.now();
    const fileName = `${timestamp}_${randomHex}${extension}`;
    return { fileName, extension };
  }

  /**
   * Validates and resolves safe filepath, strictly preventing path traversal
   */
  private resolveSafePath(fileKey: string): string {
    // Normalize and strip leading slashes
    const cleanKey = path.normalize(fileKey).replace(/^(\.\.[\/\\])+/, "");
    const fullPath = path.resolve(this.baseStorageDir, cleanKey);

    // Prevent directory traversal escape
    if (!fullPath.startsWith(this.baseStorageDir)) {
      logger.error(`[Storage Security] Directory traversal attempt detected for key: ${fileKey}`);
      throw ApiError.badRequest("Invalid file path / potential path traversal blocked");
    }

    return fullPath;
  }

  /**
   * 1. uploadFile()
   */
  async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    folder: string = "attachments"
  ): Promise<UploadResult> {
    const cleanFolder = this.sanitizeFolder(folder);
    const targetDir = path.join(this.baseStorageDir, cleanFolder);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const { fileName } = this.generateSafeFileName(originalName, mimeType);
    const fileKey = `${cleanFolder}/${fileName}`;
    const targetFilePath = path.join(targetDir, fileName);

    // Write file to disk
    await fs.promises.writeFile(targetFilePath, fileBuffer);

    const fileUrl = `${this.baseUrl}/${cleanFolder}/${fileName}`;

    logger.info(`[Storage] Saved file to local storage: ${fileKey} (${fileBuffer.length} bytes)`);

    return {
      fileKey,
      fileName,
      originalName: path.basename(originalName),
      fileUrl,
      storageProvider: StorageProvider.LOCAL,
      fileSizeBytes: fileBuffer.length,
      mimeType,
      folder: cleanFolder,
    };
  }

  /**
   * 2. getFileStream()
   */
  async getFileStream(fileKey: string): Promise<FileStreamResult> {
    const filePath = this.resolveSafePath(fileKey);

    if (!fs.existsSync(filePath)) {
      throw ApiError.notFound("Requested file does not exist in storage repository");
    }

    const stats = await fs.promises.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();

    // Map extension to mime
    let mimeType = "application/octet-stream";
    for (const [mime, extension] of Object.entries(MIME_EXTENSION_MAP)) {
      if (extension === ext) {
        mimeType = mime;
        break;
      }
    }

    const stream = fs.createReadStream(filePath);

    return {
      stream,
      mimeType,
      fileName: path.basename(filePath),
      fileSizeBytes: stats.size,
    };
  }

  /**
   * 3. deleteFile()
   */
  async deleteFile(fileKey: string): Promise<boolean> {
    try {
      const filePath = this.resolveSafePath(fileKey);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        logger.info(`[Storage] Deleted file from storage: ${fileKey}`);
        return true;
      }
      return false;
    } catch (err: any) {
      logger.error(`[Storage] Failed to delete file ${fileKey}: ${err.message}`);
      return false;
    }
  }

  /**
   * 4. getFileUrl()
   */
  getFileUrl(fileKey: string): string {
    return `${this.baseUrl}/${fileKey}`;
  }
}

export const localStorageService = new LocalStorageService();
export default localStorageService;
