import React, { useState, useRef } from "react";
import { useToast } from "../../context/ToastContext";
import { uploadApi, UploadedFileResult } from "../../api/uploadApi";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export interface FileUploadProps {
  label?: string;
  description?: string;
  accept?: string;
  maxSizeBytes?: number; // default 10MB
  folder?: string;
  value?: UploadedFileResult | null;
  onChange: (uploadedFile: UploadedFileResult | null) => void;
  disabled?: boolean;
  required?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  description = "PDF, JPG, JPEG, PNG, or WEBP up to 10MB",
  accept = "image/jpeg,image/png,image/webp,application/pdf",
  maxSizeBytes = 10 * 1024 * 1024, // 10MB
  value,
  onChange,
  disabled = false,
  required = false,
}) => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorText, setErrorText] = useState<string | null>(null);

  const allowedMimeTypes = new Set([
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ]);

  const validateAndUpload = async (file: File) => {
    setErrorText(null);

    // 1. Validate MIME Type
    if (!allowedMimeTypes.has(file.type.toLowerCase())) {
      const err = `Invalid file format (${file.type}). Only PDF and images (JPG, PNG, WEBP) are supported.`;
      setErrorText(err);
      toast.error(err, "Format Unsupported");
      return;
    }

    // 2. Validate Size Limit
    if (file.size > maxSizeBytes) {
      const mb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
      const err = `File size ${(file.size / (1024 * 1024)).toFixed(1)}MB exceeds the maximum ${mb}MB limit.`;
      setErrorText(err);
      toast.warning(err, "File Too Large");
      return;
    }

    // 3. Initiate Staging Upload
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const res = await uploadApi.uploadGeneralFile(file, (percent) => {
        setUploadProgress(percent);
      });

      if (res.success && res.data) {
        onChange(res.data);
        toast.success(`${file.name} uploaded and secured.`, "Upload Complete");
      } else {
        const err = res.message || "Failed to upload file.";
        setErrorText(err);
        toast.error(err, "Upload Error");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Network error uploading document.";
      setErrorText(msg);
      toast.error(msg, "Upload Failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isPdf = value?.mimeType === "application/pdf" || value?.originalName.toLowerCase().endsWith(".pdf");

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* 1. Uploaded File State */}
      {value ? (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 truncate">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isPdf ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
              }`}
            >
              {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
            </div>

            <div className="truncate space-y-0.5">
              <p className="text-xs font-bold text-slate-900 truncate">{value.originalName}</p>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                <span>{(value.fileSizeBytes / 1024).toFixed(1)} KB</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Secured & Stored
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              title="Replace file"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition text-xs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || isUploading}
              title="Remove file"
              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition text-xs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* 2. Drag & Drop Upload Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 ${
            isDragging
              ? "border-blue-600 bg-blue-50/60"
              : isUploading
              ? "border-amber-400 bg-amber-50/30 cursor-wait"
              : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/80 bg-white"
          }`}
        >
          {isUploading ? (
            <div className="space-y-2 w-full max-w-xs">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-800">
                Encrypting & Uploading... ({uploadProgress}%)
              </p>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800">
                  <span className="text-blue-700 underline">Click to upload document</span> or drag & drop
                </p>
                <p className="text-[11px] text-slate-400">{description}</p>
              </div>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
            disabled={disabled || isUploading}
            className="hidden"
          />
        </div>
      )}

      {errorText && (
        <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 pt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorText}</span>
        </p>
      )}
    </div>
  );
};

export default FileUpload;
