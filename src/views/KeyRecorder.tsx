import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { keyLabel } from "@/model/domain/keybindings";
import { useT } from "@/presenters/useT";

interface Props {
  code: string;
  onCapture: (code: string) => void;
  className?: string;
}

/** Click to record the next key press as a binding. Esc cancels. */
export function KeyRecorder({ code, onCapture, className }: Props) {
  const t = useT();
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    if (!recording) return;
    const onKey = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.code !== "Escape") onCapture(event.code);
      setRecording(false);
    };
    // Capture phase so it wins over any other key handlers.
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [recording, onCapture]);

  return (
    <button
      type="button"
      title={
        recording
          ? t((m) => m.keyRecorder.recording)
          : t((m) => m.keyRecorder.rebind)
      }
      onClick={() => setRecording(true)}
      className={cn(
        "flex items-center justify-center rounded-md border text-sm font-medium transition-colors",
        recording
          ? "animate-pulse border-primary bg-primary/15 text-primary"
          : "border-border bg-muted/40 text-foreground hover:bg-muted/70",
        className,
      )}
    >
      {recording ? "…" : keyLabel(code)}
    </button>
  );
}
