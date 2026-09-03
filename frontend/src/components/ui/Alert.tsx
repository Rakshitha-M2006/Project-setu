import React from "react";
import { cn } from "../../utils/cn";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "danger";
  title?: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  className,
  variant = "info",
  title,
  children,
  onClose,
  ...props
}) => {
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-900 [&>svg]:text-blue-600",
    success: "bg-emerald-50 border-emerald-200 text-emerald-900 [&>svg]:text-emerald-600",
    warning: "bg-amber-50 border-amber-200 text-amber-900 [&>svg]:text-amber-600",
    danger: "bg-rose-50 border-rose-200 text-rose-900 [&>svg]:text-rose-600",
  };

  const icons = {
    info: <Info className="w-5 h-5 shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 shrink-0" />,
    danger: <AlertCircle className="w-5 h-5 shrink-0" />,
  };

  return (
    <div
      role="alert"
      className={cn(
        "relative flex items-start gap-3 rounded-xl border p-4 text-xs sm:text-sm",
        styles[variant],
        className
      )}
      {...props}
    >
      <div className="mt-0.5">{icons[variant]}</div>

      <div className="flex-1 space-y-0.5">
        {title && <h5 className="font-bold tracking-tight">{title}</h5>}
        <div className="opacity-90 leading-relaxed">{children}</div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-md opacity-60 hover:opacity-100 hover:bg-black/5 transition -mr-1 -mt-1"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
