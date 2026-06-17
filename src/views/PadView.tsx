import { cn } from "@/lib/utils";
import type { PadId } from "@/model/domain/pad";
import type { PadVm } from "@/presenters/usePadGrid";

interface Props {
  pad: PadVm;
  onPress: (pad: PadId) => void;
  onRelease: (pad: PadId) => void;
}

/** Presentational pad. Props in, callbacks out — no logic. */
export function PadView({ pad, onPress, onRelease }: Props) {
  return (
    <button
      type="button"
      onPointerDown={() => onPress(pad.id)}
      onPointerUp={() => onRelease(pad.id)}
      onPointerLeave={() => onRelease(pad.id)}
      className={cn(
        "aspect-square select-none rounded-xl border text-lg font-semibold transition-all duration-75",
        "border-border bg-card text-muted-foreground",
        pad.lit &&
          "scale-95 border-primary bg-primary text-primary-foreground shadow-lg",
      )}
    >
      {pad.label}
    </button>
  );
}
