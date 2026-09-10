import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title?: string;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icon = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
  }[toast.type];

  const borderTheme = {
    success: "border-emerald-500/25 shadow-emerald-950/20",
    error: "border-rose-500/25 shadow-rose-950/20",
    warning: "border-amber-500/25 shadow-amber-950/20",
    info: "border-sky-500/25 shadow-sky-950/20",
  }[toast.type];

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-neutral-900/90 backdrop-blur-2xl border ${borderTheme} shadow-2xl text-neutral-100 transition-all duration-300 animate-in fade-in slide-in-from-top-4`}
    >
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 text-xs leading-relaxed">
        {toast.title && <div className="font-medium text-sm text-white mb-0.5">{toast.title}</div>}
        <div className="text-neutral-300 break-words">{toast.message}</div>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
