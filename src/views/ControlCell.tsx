import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface Props {
  active: boolean;
  title: string;
  onClick: () => void;
  children: ReactNode;
}

/** Square control-cell used by the mode buttons; active = filled. */
export function ControlCell({ active, title, onClick, children }: Props) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "flex select-none items-center justify-center rounded-[14%] border transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-muted/40 text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
