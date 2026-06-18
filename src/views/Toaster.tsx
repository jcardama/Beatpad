import { useEffect } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  useToastStore,
  type Toast,
  type ToastVariant,
} from "@/model/store/toastStore";
import { useT } from "@/presenters/useT";

/** How long each variant stays before auto-dismissing (ms). `update` is sticky
 *  — it carries an action, so the user dismisses it deliberately. */
const AUTO_DISMISS: Record<ToastVariant, number | null> = {
  info: 5000,
  error: 7000,
  update: null,
};

const ACCENT: Record<ToastVariant, string> = {
  info: "border-l-foreground/30",
  error: "border-l-destructive",
  update: "border-l-primary",
};

/** Stacked in-app notifications, bottom-right. */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const t = useT();
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    const ms = AUTO_DISMISS[toast.variant];
    if (ms == null) return;
    const timer = setTimeout(() => dismiss(toast.id), ms);
    return () => clearTimeout(timer);
  }, [toast.id, toast.variant, dismiss]);

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-lg border border-l-4 bg-popover px-3 py-2.5 text-sm text-popover-foreground shadow-lg",
        ACCENT[toast.variant],
      )}
    >
      <p className="flex-1 whitespace-pre-line">{toast.message}</p>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick();
            dismiss(toast.id);
          }}
          className="font-medium text-primary hover:underline"
        >
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        aria-label={t((m) => m.toast.dismiss)}
        onClick={() => dismiss(toast.id)}
        className="text-muted-foreground hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
