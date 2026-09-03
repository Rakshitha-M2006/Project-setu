import multer from "multer";
import { Request } from "express";
import { ApiError } from "../utils/apiError";

// Allowed MIME types
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

// 10 MB maximum file size limit
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const mime = file.mimetype.toLowerCase();

  if (!ALLOWED_MIME_TYPES.has(mime)) {
    return cb(
      ApiError.badRequest(
        `Unsupported file type '${file.mimetype}'. Only PDF, JPG, JPEG, PNG, and WEBP files are allowed.`
      )
    );
  }

  cb(null, true);
};

export const uploadSingle = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
  fileFilter,
}).single("file");

export const uploadMultiple = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 5,
  },
  fileFilter,
}).array("files", 5);

export default { uploadSingle, uploadMultiple };
