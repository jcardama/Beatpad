import { memo, type PointerEvent } from "react";
import { Music, Trash2 } from "lucide-react";

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
  /** Name of a file being dragged over this pad, if any. */
  dropName?: string | null;
}

/** Presentational beat cell with a right-click menu to set its mode, change, or
 *  clear its sound. Empty pads sit recessed and inert; loaded pads are raised. */
export const PadView = memo(function PadView({
  pad,
  active,
  onPress,
  onRelease,
  onSetMode,
  onAssign,
  onClear,
  dropName = null,
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
          data-pad={pad.id}
          className={cn(
            "relative flex select-none items-center justify-center rounded-[16%] text-[clamp(0.6rem,2.2vmin,1rem)] transition-[scale,box-shadow,background-color] duration-75",
            empty ? "well text-text-subtle" : pad.lit ? "pressed scale-[.96]" : "raised",
            !active && "opacity-40",
            !empty &&
              pad.looping &&
              "animate-pulse outline-[1.5px] outline-offset-3 outline-ink-strong outline-solid",
            dropName !== null &&
              "outline-[1.5px] outline-offset-3 outline-selection-ring outline-solid",
          )}
        >
          {pad.label}
          {dropName !== null && (
            <span className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-20 max-w-60 -translate-x-1/2 truncate rounded-full bg-menu-surface px-2.5 py-0.5 text-text shadow-floating">
              {dropName}
            </span>
          )}
        </button>
      </ContextMenuTrigger>

      <ContextMenuContent>
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
          <Music />
          {empty ? t((m) => m.pad.loadSound) : t((m) => m.pad.changeSound)}
        </ContextMenuItem>
        {!empty && (
          <ContextMenuItem onSelect={() => onClear(pad.id)}>
            <Trash2 />
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
  prev.dropName === next.dropName &&
  prev.onPress === next.onPress &&
  prev.onRelease === next.onRelease &&
  prev.onSetMode === next.onSetMode &&
  prev.onAssign === next.onAssign &&
  prev.onClear === next.onClear,
);
