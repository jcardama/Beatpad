import { cn } from "@/lib/utils";
import type { PadId } from "@/model/domain/pad";
import type { PadVm } from "@/presenters/usePadGrid";

interface Props {
  pad: PadVm;
  /** Whether this pad's bank is the one the keyboard currently addresses. */
  active: boolean;
  onPress: (pad: PadId) => void;
  onRelease: (pad: PadId) => void;
}

/** Presentational beat cell. Props in, callbacks out — no logic. */
export function PadView({ pad, active, onPress, onRelease }: Props) {
  return (
    <button
      type="button"
      onPointerDown={() => onPress(pad.id)}
      onPointerUp={() => onRelease(pad.id)}
      onPointerLeave={() => onRelease(pad.id)}
      className={cn(
        "flex select-none items-center justify-center rounded-[14%] border text-[clamp(0.6rem,2.2vmin,1rem)] font-semibold transition-all duration-75",
        "border-border bg-card text-muted-foreground",
        !active && "opacity-55",
        pad.looping && "animate-pulse ring-2 ring-primary",
        pad.lit &&
          "scale-95 border-primary bg-primary text-primary-foreground shadow-lg",
      )}
    >
      {pad.label}
    </button>
  );
}
