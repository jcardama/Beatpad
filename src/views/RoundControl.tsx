import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface Props {
  active?: boolean;
  title: string;
  label: string;
  onClick: () => void;
  children: ReactNode;
}

/** Round framing button: raised at rest, pressed and filled when `active`. */
export function RoundControl({ active = false, title, label, onClick, children }: Props) {
  return (
    <button
      type="button"
      title={title}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "icon-line relative flex aspect-square size-[78%] select-none items-center justify-center place-self-center rounded-full transition-[translate] duration-100 active:translate-y-px",
        active ? "pressed" : "raised",
      )}
    >
      {children}
    </button>
  );
}
