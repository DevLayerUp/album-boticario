"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type FeedbackToastVariant = "success" | "error" | "info" | "warning";

export interface FeedbackToastPayload {
  message: string;
  variant?: FeedbackToastVariant;
  duration?: number;
}

interface FeedbackToastItem extends Required<Pick<FeedbackToastPayload, "message">> {
  id: string;
  variant: FeedbackToastVariant;
  duration: number;
}

const VARIANT_META: Record<
  FeedbackToastVariant,
  {
    icon: typeof CheckCircle2;
    container: string;
    iconWrap: string;
    iconClass: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    container:
      "border-verde-500/80 bg-surface text-verde-escuro-capa shadow-lg shadow-verde-escuro-500/10 ring-1 ring-verde-200/80",
    iconWrap: "bg-verde-100",
    iconClass: "text-verde-escuro-500",
  },
  error: {
    icon: XCircle,
    container:
      "border-red-500/80 bg-red-50 text-red-900 shadow-lg shadow-red-500/10 ring-1 ring-red-200/80",
    iconWrap: "bg-red-100",
    iconClass: "text-red-600",
  },
  warning: {
    icon: AlertTriangle,
    container:
      "border-amber-500/80 bg-amber-50 text-amber-950 shadow-lg shadow-amber-500/10 ring-1 ring-amber-200/80",
    iconWrap: "bg-amber-100",
    iconClass: "text-amber-700",
  },
  info: {
    icon: Info,
    container:
      "border-verde-escuro-500/70 bg-verde-100 text-verde-escuro-capa shadow-lg shadow-verde-escuro-500/10 ring-1 ring-verde-300/60",
    iconWrap: "bg-verde-200/60",
    iconClass: "text-verde-escuro-500",
  },
};

const DEFAULT_DURATION = 4200;

type FeedbackToastContextValue = {
  showToast: (payload: FeedbackToastPayload | string, variant?: FeedbackToastVariant) => void;
};

const FeedbackToastContext = createContext<FeedbackToastContextValue | null>(null);

export function useFeedbackToast() {
  const ctx = useContext(FeedbackToastContext);
  if (!ctx) {
    throw new Error("useFeedbackToast must be used within FeedbackToastProvider");
  }
  return ctx;
}

/** Retorna null fora do provider — útil em componentes compartilhados. */
export function useFeedbackToastOptional() {
  return useContext(FeedbackToastContext);
}

export async function parseApiError(
  res: Response,
  fallback = "Não foi possível concluir a operação.",
): Promise<string> {
  const data = await res.json().catch(() => ({}));
  return typeof data?.error === "string" ? data.error : fallback;
}

function FeedbackToastCard({
  toast,
  onDismiss,
}: {
  toast: FeedbackToastItem;
  onDismiss: (id: string) => void;
}) {
  const reduceMotion = useReducedMotion();
  const meta = VARIANT_META[toast.variant];
  const Icon = meta.icon;
  const isAlert = toast.variant === "error" || toast.variant === "warning";

  return (
    <motion.div
      layout={!reduceMotion}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      role={isAlert ? "alert" : "status"}
      aria-live={isAlert ? "assertive" : "polite"}
      className={cn(
        "pointer-events-auto flex w-full items-start gap-3 rounded-[18px] border-l-[5px] px-3.5 py-3 sm:px-4 sm:py-3.5",
        meta.container,
      )}
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl sm:size-10",
          meta.iconWrap,
        )}
      >
        <Icon size={18} className={meta.iconClass} aria-hidden />
      </div>
      <p className="min-w-0 flex-1 pt-1.5 text-sm font-semibold leading-snug sm:text-[15px]">
        {toast.message}
      </p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-current/50 transition-colors duration-200 hover:bg-black/5 hover:text-current"
        aria-label="Fechar alerta"
      >
        <X size={16} aria-hidden />
      </button>
    </motion.div>
  );
}

export function FeedbackToastProvider({
  children,
  regionLabel = "Alertas",
}: {
  children: React.ReactNode;
  regionLabel?: string;
}) {
  const [toasts, setToasts] = useState<FeedbackToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const regionId = useId();

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (payload: FeedbackToastPayload | string, variant: FeedbackToastVariant = "success") => {
      const normalized: FeedbackToastPayload =
        typeof payload === "string" ? { message: payload, variant } : payload;

      const id = crypto.randomUUID();
      const item: FeedbackToastItem = {
        id,
        message: normalized.message,
        variant: normalized.variant ?? variant,
        duration: normalized.duration ?? DEFAULT_DURATION,
      };

      setToasts((prev) => [...prev.slice(-2), item]);

      const timer = setTimeout(() => dismiss(id), item.duration);
      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
    };
  }, []);

  return (
    <FeedbackToastContext.Provider value={{ showToast }}>
      {children}
      <div
        id={regionId}
        aria-label={regionLabel}
        className="pointer-events-none fixed inset-x-0 top-3 z-[70] flex flex-col items-center gap-2 px-4 sm:top-5"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <div key={toast.id} className="w-full max-w-md">
              <FeedbackToastCard toast={toast} onDismiss={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </FeedbackToastContext.Provider>
  );
}
