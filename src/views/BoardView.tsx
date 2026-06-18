import type { ReactNode } from "react";
import { Circle, Hand, Repeat } from "lucide-react";

import {
  GRID,
  PAD_MODES,
  type Bank,
  type PadId,
  type PadMode,
} from "@/model/domain/pad";
import type { PadVm } from "@/presenters/usePadGrid";
import { BankToggle } from "./BankToggle";
import { ControlCell } from "./ControlCell";
import { PadView } from "./PadView";

const COLS = GRID.cols + 1; // 9: beats + right lane
const ROWS = GRID.rows + 1; // 9: top lane + beats
const RIGHT_LANE = COLS - 1;
const BOTTOM_ROW = ROWS - 1;

const MODE_ICON: Record<PadMode, typeof Circle> = {
  one_shot: Circle,
  hold_loop: Hand,
  toggle_loop: Repeat,
};

interface Props {
  pads: PadVm[];
  bank: Bank;
  /** Whether the banked layout is active (bank toggle + half-dimming). */
  banked: boolean;
  mode: PadMode;
  onToggleBank: () => void;
  onPress: (pad: PadId) => void;
  onRelease: (pad: PadId) => void;
  onSetGlobalMode: (mode: PadMode) => void;
  onSetPadMode: (pad: PadId, mode: PadMode) => void;
  onAssign: (pad: PadId) => void;
  onClear: (pad: PadId) => void;
}

function reservedDot(key: string): ReactNode {
  return (
    <div
      key={key}
      className="aspect-square size-[78%] place-self-center rounded-full border border-border bg-muted/30"
    />
  );
}

/**
 * The whole instrument as one cohesive square grid: an 8×8 beat field framed by
 * Launchpad-style round buttons. Top lane: bank toggle, load-pack, the three
 * play-mode buttons, then the logo. The right column is reserved for future
 * controls. Each pad's mode/sound is also settable from its right-click menu.
 */
export function BoardView({
  pads,
  bank,
  banked,
  mode,
  onToggleBank,
  onPress,
  onRelease,
  onSetGlobalMode,
  onSetPadMode,
  onAssign,
  onClear,
}: Props) {
  const cells: ReactNode[] = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      // Beats: rows 1..8, cols 0..7.
      if (r >= 1 && c < GRID.cols) {
        const pad = pads[(r - 1) * GRID.cols + c];
        cells.push(
          <PadView
            key={`p${pad.id}`}
            pad={pad}
            active={!banked || pad.bank === bank}
            onPress={onPress}
            onRelease={onRelease}
            onSetMode={onSetPadMode}
            onAssign={onAssign}
            onClear={onClear}
          />,
        );
        continue;
      }

      // Bank toggle: top-left (banked layout only).
      if (r === 0 && c === 0) {
        cells.push(
          banked ? (
            <BankToggle key="bank" bank={bank} onToggle={onToggleBank} />
          ) : (
            reservedDot("bank-empty")
          ),
        );
        continue;
      }

      // Logo: top-right corner.
      if (r === 0 && c === RIGHT_LANE) {
        cells.push(
          <div key="logo" className="flex items-center justify-center">
            <img src="/logo.svg" alt="BeatPad" className="size-[68%]" />
          </div>,
        );
        continue;
      }

      // Global play-mode buttons: right column, anchored at the bottom, growing
      // up (one-shot lowest, then hold-loop, then toggle-loop).
      const modeIndex = BOTTOM_ROW - r;
      if (c === RIGHT_LANE && modeIndex >= 0 && modeIndex < PAD_MODES.length) {
        const m = PAD_MODES[modeIndex];
        const Icon = MODE_ICON[m.id];
        cells.push(
          <ControlCell
            key={`mode-${m.id}`}
            active={mode === m.id}
            title={`${m.label} (all pads)`}
            onClick={() => onSetGlobalMode(m.id)}
          >
            <Icon className="size-[45%]" />
          </ControlCell>,
        );
        continue;
      }

      // Reserved round buttons (rest of the top lane + the right column).
      cells.push(reservedDot(`r${r}-${c}`));
    }
  }

  return (
    <div
      className="grid h-full w-full gap-[1.5%]"
      style={{
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
      }}
    >
      {cells}
    </div>
  );
}
