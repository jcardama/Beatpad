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
        "flex aspect-square select-none items-center justify-center place-self-center rounded-full border transition-colors",
        "size-[78%]",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
