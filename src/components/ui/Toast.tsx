"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

type Toast = {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
};

type ToastContextType = {
  toast: (type: ToastType, title: string, description?: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback(
    (type: ToastType, title: string, description?: string) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, type, title, description }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  const api: ToastContextType = {
    toast: add,
    success: (t, d) => add("success", t, d),
    error: (t, d) => add("error", t, d),
    info: (t, d) => add("info", t, d),
    warning: (t, d) => add("warning", t, d),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Toast Container */}
      <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-full max-w-sm flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: () => void;
}) {
  const config = {
    success: {
      icon: CheckCircle2,
      border: "border-emerald-400/30",
      bg: "bg-emerald-500/10",
      text: "text-emerald-300",
      glow: "shadow-emerald-500/20",
    },
    error: {
      icon: XCircle,
      border: "border-red-400/30",
      bg: "bg-red-500/10",
      text: "text-red-300",
      glow: "shadow-red-500/20",
    },
    info: {
      icon: Info,
      border: "border-cyan-400/30",
      bg: "bg-cyan-500/10",
      text: "text-cyan-300",
      glow: "shadow-cyan-500/20",
    },
    warning: {
      icon: AlertTriangle,
      border: "border-amber-400/30",
      bg: "bg-amber-500/10",
      text: "text-amber-300",
      glow: "shadow-amber-500/20",
    },
  };

  const c = config[toast.type];
  const Icon = c.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border ${c.border} ${c.bg} p-4 shadow-2xl ${c.glow} backdrop-blur-2xl`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0A1628] ${c.text}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className={`text-sm font-black ${c.text}`}>{toast.title}</p>
          {toast.description && (
            <p className="mt-0.5 text-xs text-slate-400">
              {toast.description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}