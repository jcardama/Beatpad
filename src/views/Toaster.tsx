import { useEffect } from "react";
import { TriangleAlert, X } from "lucide-react";

import { Button } from "@/components/ui/button";
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

/** Stacked in-app notifications, bottom-right. */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[340px] max-w-[calc(100vw-2rem)] flex-col gap-2"
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
  // Messages put a headline first and any detail after the first newline.
  const [headline, ...rest] = toast.message.split("\n");
  const detail = rest.join("\n");

  useEffect(() => {
    const ms = AUTO_DISMISS[toast.variant];
    if (ms == null) return;
    const timer = setTimeout(() => dismiss(toast.id), ms);
    return () => clearTimeout(timer);
  }, [toast.id, toast.variant, dismiss]);

  return (
    <div
      role="status"
      className="edge-menu icon-line pointer-events-auto relative flex items-start gap-(--space-2) rounded-(--radius-control) bg-menu-surface p-(--space-2) text-text shadow-floating"
    >
      {toast.variant === "error" && <TriangleAlert className="mt-0.5 size-4 shrink-0" />}
      <div className="min-w-0 flex-1 self-center">
        <p className="break-words">{headline}</p>
        {detail && (
          <p className="break-words whitespace-pre-line text-text-subtle">{detail}</p>
        )}
      </div>
      {toast.action && (
        <Button
          variant="secondary"
          className="self-center"
          onClick={() => {
            toast.action?.onClick();
            dismiss(toast.id);
          }}
        >
          {toast.action.label}
        </Button>
      )}
      <button
        type="button"
        aria-label={t((m) => m.toast.dismiss)}
        onClick={() => dismiss(toast.id)}
        className="mt-0.5 shrink-0 text-text-subtle hover:text-text"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
