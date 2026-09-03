import React from "react";
import { useToast } from "../../context/ToastContext";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "../../utils/cn";

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="fixed bottom-4 right-4 z-50 flex flex-col space-y-3 max-w-md w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";
        const isWarning = toast.type === "warning";
        const isInfo = toast.type === "info";

        return (
          <div
            key={toast.id}
            role="alert"
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all transform ease-out duration-300 translate-y-0",
              isSuccess && "bg-emerald-50 border-emerald-200 text-emerald-900 shadow-emerald-900/5",
              isError && "bg-rose-50 border-rose-200 text-rose-900 shadow-rose-900/5",
              isWarning && "bg-amber-50 border-amber-200 text-amber-900 shadow-amber-900/5",
              isInfo && "bg-blue-50 border-blue-200 text-blue-900 shadow-blue-900/5"
            )}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-600" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600" />}
              {isInfo && <Info className="w-5 h-5 text-blue-600" />}
            </div>

            <div className="flex-1 text-sm">
              {toast.title && <h5 className="font-semibold mb-0.5">{toast.title}</h5>}
              <p className="text-xs sm:text-sm opacity-90 leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 p-1 rounded-md opacity-60 hover:opacity-100 hover:bg-black/5 transition"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
