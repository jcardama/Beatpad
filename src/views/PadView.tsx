import { memo, type PointerEvent } from "react";

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
import type { PadVm } from "@/presenters/padVm";
import { useT } from "@/presenters/useT";

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
export const PadView = memo(function PadView({
  pad,
  active,
  onPress,
  onRelease,
  onSetMode,
  onAssign,
  onClear,
}: Props) {
  const t = useT();
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
          // Played via pointer or the global keyboard handler, not Tab focus.
          tabIndex={-1}
          aria-label={t((m) => m.board.padLabel(pad.id + 1))}
          onPointerDown={press}
          onPointerUp={release}
          onPointerLeave={release}
          className={cn(
            "relative flex select-none items-center justify-center rounded-[18%] text-[clamp(0.6rem,2.2vmin,1rem)] font-semibold transition-all duration-75",
            empty
              ? "border border-dashed border-border bg-foreground/[0.02] text-muted-foreground shadow-[inset_0_1px_3px_rgb(0_0_0/0.1)]"
              : "edge-light border border-pad-lit/25 text-foreground",
            !empty && !pad.lit && "tactile bg-pad-lit/15",
            !empty && !active && "opacity-40",
            !empty && pad.looping && "ring-2 ring-pad-lit animate-pulse",
            !empty &&
              pad.lit &&
              "scale-95 border-pad-lit bg-pad-lit text-pad-lit-foreground shadow-[0_0_22px_-2px_var(--pad-lit)]",
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
          {PAD_MODES.map((id) => (
            <ContextMenuRadioItem key={id} value={id}>
              {t((m) => m.mode[id])}
            </ContextMenuRadioItem>
          ))}
        </ContextMenuRadioGroup>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => onAssign(pad.id)}>
          {empty ? t((m) => m.pad.loadSound) : t((m) => m.pad.changeSound)}
        </ContextMenuItem>
        {!empty && (
          <ContextMenuItem
            variant="destructive"
            onSelect={() => onClear(pad.id)}
          >
            {t((m) => m.pad.clearSound)}
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}, (prev, next) =>
  prev.pad.id === next.pad.id &&
  prev.pad.label === next.pad.label &&
  prev.pad.bank === next.pad.bank &&
  prev.pad.lit === next.pad.lit &&
  prev.pad.looping === next.pad.looping &&
  prev.pad.loaded === next.pad.loaded &&
  prev.pad.mode === next.pad.mode &&
  prev.active === next.active &&
  prev.onPress === next.onPress &&
  prev.onRelease === next.onRelease &&
  prev.onSetMode === next.onSetMode &&
  prev.onAssign === next.onAssign &&
  prev.onClear === next.onClear,
);
