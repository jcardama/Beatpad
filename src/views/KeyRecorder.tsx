import { useEffect, useState } from "react";
import { Popover } from "radix-ui";

import { cn } from "@/lib/utils";
import { keyLabel } from "@/model/domain/keybindings";
import { useT } from "@/presenters/useT";

interface Props {
  code: string;
  onCapture: (code: string) => void;
  className?: string;
}

/** A keycap: click to record the next key press as a binding. Esc or a click
 *  elsewhere cancels. While recording, a floating pill shows the hint. */
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
    <Popover.Root open={recording} onOpenChange={setRecording}>
      <Popover.Anchor asChild>
        <button
          type="button"
          title={recording ? undefined : t((m) => m.keyRecorder.rebind)}
          onClick={() => setRecording(true)}
          className={cn(
            "flex items-center justify-center rounded-(--radius-menu) transition-[translate] duration-100 active:translate-y-px",
            recording ? "pressed" : "raised",
            className,
          )}
        >
          {recording ? "…" : keyLabel(code)}
        </button>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          side="top"
          sideOffset={8}
          collisionPadding={12}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="z-50 rounded-full bg-menu-surface px-2.5 py-1 whitespace-nowrap text-text shadow-floating"
        >
          {t((m) => m.keyRecorder.recording)}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
