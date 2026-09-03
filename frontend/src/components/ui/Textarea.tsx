import React from "react";
import { cn } from "../../utils/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  requiredMarker?: boolean;
  showCount?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      required,
      requiredMarker = required,
      maxLength,
      value,
      id,
      disabled,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
    const charCount = typeof value === "string" ? value.length : 0;

    return (
      <div className="w-full space-y-1.5">
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={textareaId}
              className="block text-xs font-semibold text-slate-700 tracking-wide"
            >
              {label}
              {requiredMarker && <span className="text-rose-600 ml-1">*</span>}
            </label>
          )}

          {maxLength && (
            <span className="text-[11px] text-slate-400 font-medium">
              {charCount} / {maxLength}
            </span>
          )}
        </div>

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          required={required}
          className={cn(
            "block w-full rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 transition-colors p-3 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed resize-y",
            error
              ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20"
              : "border-slate-300 focus:border-blue-600 focus:ring-blue-100 bg-white",
            className
          )}
          {...props}
        />

        {error ? (
          <p className="text-xs text-rose-600 font-medium mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
