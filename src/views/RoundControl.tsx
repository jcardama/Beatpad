import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const ROUND_CONTROL =
  "edge-light relative flex aspect-square size-[78%] select-none items-center justify-center place-self-center rounded-full transition-colors";

interface Props {
  active?: boolean;
  title: string;
  label: string;
  onClick: () => void;
  children: ReactNode;
}

/** Round framing button. `active` fills it; otherwise it sits muted. */
export function RoundControl({ active = false, title, label, onClick, children }: Props) {
  return (
    <button
      type="button"
      title={title}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        ROUND_CONTROL,
        active
          ? "tactile bg-primary text-primary-foreground"
          : "tactile bg-secondary text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
