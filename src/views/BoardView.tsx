import type { ReactNode } from "react";
import { FolderOpen } from "lucide-react";

import { GRID, type Bank, type PadId, type PadMode } from "@/model/domain/pad";
import type { PadVm } from "@/presenters/usePadGrid";
import { BankToggle } from "./BankToggle";
import { ControlCell } from "./ControlCell";
import { PadView } from "./PadView";

// One control lane on top (bank + load + logo). Beats sit flush in the lower
// area; per-pad mode/sound live in each pad's right-click menu.
const COLS = GRID.cols + 1; // 9: beats + right lane
const ROWS = GRID.rows + 1; // 9: top lane + beats
const RIGHT_LANE = COLS - 1;

interface Props {
  pads: PadVm[];
  bank: Bank;
  onToggleBank: () => void;
  onPress: (pad: PadId) => void;
  onRelease: (pad: PadId) => void;
  onSetMode: (pad: PadId, mode: PadMode) => void;
  onAssign: (pad: PadId) => void;
  onClear: (pad: PadId) => void;
  onLoadPack: () => void;
}

/**
 * The whole instrument as one cohesive square grid: an 8×8 beat field with a top
 * lane holding the bank toggle, a load-pack button, and the logo. The right
 * column is reserved (empty) for future controls. Each pad's mode and sound are
 * set from its right-click menu.
 */
export function BoardView({
  pads,
  bank,
  onToggleBank,
  onPress,
  onRelease,
  onSetMode,
  onAssign,
  onClear,
  onLoadPack,
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
            onSetMode={onSetMode}
            onAssign={onAssign}
            onClear={onClear}
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

      // Load a .beat pack: top lane, next to the bank toggle.
      if (r === 0 && c === 1) {
        cells.push(
          <ControlCell
            key="loadpack"
            active={false}
            title="Load a .beat pack"
            onClick={onLoadPack}
          >
            <FolderOpen className="size-[45%]" />
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
