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

// One control lane on top (bank + logo) and one on the right (modes). Beats sit
// flush in the lower-left, so there is no empty left column or bottom row.
const COLS = GRID.cols + 1; // 9: beats + right lane
const ROWS = GRID.rows + 1; // 9: top lane + beats
const RIGHT_LANE = COLS - 1; // x of the mode column
const BOTTOM_ROW = ROWS - 1; // y of the bottom beat row

const MODE_ICON: Record<PadMode, typeof Circle> = {
  one_shot: Circle,
  hold_loop: Hand,
  toggle_loop: Repeat,
};

interface Props {
  pads: PadVm[];
  mode: PadMode;
  bank: Bank;
  onSetMode: (mode: PadMode) => void;
  onToggleBank: () => void;
  onPress: (pad: PadId) => void;
  onRelease: (pad: PadId) => void;
}

/**
 * The whole instrument as one cohesive square grid: an 8×8 beat field with a top
 * lane (bank selector at the left, logo at the right) and a right lane (modes,
 * anchored at the bottom and growing up). Middle cells of each lane are reserved
 * (empty) for future controls.
 */
export function BoardView({
  pads,
  mode,
  bank,
  onSetMode,
  onToggleBank,
  onPress,
  onRelease,
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
            active={pad.bank === bank}
            onPress={onPress}
            onRelease={onRelease}
          />,
        );
        continue;
      }

      // Logo: top-right corner.
      if (r === 0 && c === RIGHT_LANE) {
        cells.push(
          <div key="logo" className="flex items-center justify-center">
            <img src="/logo.svg" alt="BeatPad" className="size-[72%]" />
          </div>,
        );
        continue;
      }

      // Bank toggle: top-left.
      if (r === 0 && c === 0) {
        cells.push(<BankToggle key="bank" bank={bank} onToggle={onToggleBank} />);
        continue;
      }

      // Mode buttons: right lane, anchored at the bottom beat row, growing up.
      const modeIndex = BOTTOM_ROW - r;
      if (c === RIGHT_LANE && modeIndex >= 0 && modeIndex < PAD_MODES.length) {
        const m = PAD_MODES[modeIndex];
        const Icon = MODE_ICON[m.id];
        cells.push(
          <ControlCell
            key={`m${m.id}`}
            active={mode === m.id}
            title={m.label}
            onClick={() => onSetMode(m.id)}
          >
            <Icon className="size-[45%]" />
          </ControlCell>,
        );
        continue;
      }

      // Reserved / empty lane cell.
      cells.push(<div key={`e${r}-${c}`} />);
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
