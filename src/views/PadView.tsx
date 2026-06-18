import type { PointerEvent } from "react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { PAD_MODES, type PadId, type PadMode } from "@/model/domain/pad";
import type { PadVm } from "@/presenters/usePadGrid";

interface Props {
  pad: PadVm;
  /** Whether this pad's bank is the one the keyboard currently addresses. */
  active: boolean;
  onPress: (pad: PadId) => void;
  onRelease: (pad: PadId) => void;
  onSetMode: (pad: PadId, mode: PadMode) => void;
  onAssign: (pad: PadId) => void;
  onClear: (pad: PadId) => void;
}

/** Presentational beat cell with a right-click menu to set its mode, change, or
 *  clear its sound. Empty pads are greyed and inert. */
export function PadView({
  pad,
  active,
  onPress,
  onRelease,
  onSetMode,
  onAssign,
  onClear,
}: Props) {
  const empty = !pad.loaded;
  const press = (e: PointerEvent) => {
    if (!empty && e.button === 0) onPress(pad.id);
  };
  const release = () => {
    if (!empty) onRelease(pad.id);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          type="button"
          onPointerDown={press}
          onPointerUp={release}
          onPointerLeave={release}
          className={cn(
            "flex select-none items-center justify-center rounded-[16%] border text-[clamp(0.6rem,2.2vmin,1rem)] font-semibold transition-all duration-75",
            empty
              ? "border border-dashed border-border bg-muted/40 text-muted-foreground"
              : "border-primary/30 bg-gradient-to-br from-primary/40 to-primary/15 text-foreground",
            !empty && !active && "opacity-45",
            !empty && pad.looping && "ring-2 ring-primary animate-pulse",
            !empty &&
              pad.lit &&
              "scale-95 border-primary bg-primary bg-none text-primary-foreground shadow-lg shadow-primary/30",
          )}
        >
          {pad.label}
        </button>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-44">
        <ContextMenuRadioGroup
          value={pad.mode}
          onValueChange={(v) => onSetMode(pad.id, v as PadMode)}
        >
          {PAD_MODES.map((m) => (
            <ContextMenuRadioItem key={m.id} value={m.id}>
              {m.label}
            </ContextMenuRadioItem>
          ))}
        </ContextMenuRadioGroup>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => onAssign(pad.id)}>
          {empty ? "Load sound…" : "Change sound…"}
        </ContextMenuItem>
        {!empty && (
          <ContextMenuItem
            variant="destructive"
            onSelect={() => onClear(pad.id)}
          >
            Clear sound
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
