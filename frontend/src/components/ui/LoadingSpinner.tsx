import React from "react";
import { cn } from "../../utils/cn";
import { Loader2 } from "lucide-react";

export interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className,
  size = "md",
  label,
}) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3 py-6">
      <Loader2 className={cn("animate-spin text-blue-700", sizes[size], className)} />
      {label && <p className="text-xs sm:text-sm font-medium text-slate-500">{label}</p>}
    </div>
  );
};

export const FullPageLoader: React.FC<{ message?: string }> = ({
  message = "Loading Government Portal...",
}) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-blue-700/10 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-blue-700 animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <h4 className="font-bold text-slate-900 text-sm">{message}</h4>
        <p className="text-xs text-slate-400">Verifying security parameters & credentials</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
