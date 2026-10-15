import type { ReactNode, Ref } from "react";
import { Circle, Hand, Repeat } from "lucide-react";

import {
  GRID,
  PAD_MODES,
  type Bank,
  type PadId,
  type PadMode,
} from "@/model/domain/pad";
import { Button } from "@/components/ui/button";
import type { PadVm } from "@/presenters/padVm";
import type { DropTarget } from "@/presenters/usePadDrop";
import { useT } from "@/presenters/useT";
import { BankToggle } from "./BankToggle";
import { PadView } from "./PadView";
import { RoundControl } from "./RoundControl";

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
  ref?: Ref<HTMLDivElement>;
  pads: PadVm[];
  /** No pad has a sound: show the first-run prompt over the beat field. */
  empty: boolean;
  /** The pad a dragged file is over. */
  dropTarget: DropTarget | null;
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
  onOpenPack: () => void;
}

function spacer(key: string): ReactNode {
  return <div key={key} />;
}

/**
 * The whole instrument as one cohesive square grid: an 8×8 beat field framed by
 * the bank toggle (top-left), the play-mode buttons (right column), and the
 * logo (top-right). Unused frame cells are left empty. Each pad's mode/sound is
 * also settable from its right-click menu.
 */
export function BoardView({
  ref,
  pads,
  empty,
  dropTarget,
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
  onOpenPack,
}: Props) {
  const t = useT();
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
            dropName={dropTarget?.pad === pad.id ? dropTarget.name : null}
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
            spacer("bank-empty")
          ),
        );
        continue;
      }

      // Logo: top-right corner.
      if (r === 0 && c === RIGHT_LANE) {
        cells.push(
          <div key="logo" className="flex items-center justify-center">
            <img
              src="/logo.svg"
              alt={t((m) => m.board.logoAlt)}
              className="size-[68%]"
            />
          </div>,
        );
        continue;
      }

      // Global play-mode buttons: right column, anchored at the bottom, growing
      // up (one-shot lowest, then hold-loop, then toggle-loop).
      const modeIndex = BOTTOM_ROW - r;
      if (c === RIGHT_LANE && modeIndex >= 0 && modeIndex < PAD_MODES.length) {
        const id = PAD_MODES[modeIndex];
        const Icon = MODE_ICON[id];
        const label = t((m) => m.mode[id]);
        cells.push(
          <RoundControl
            key={`mode-${id}`}
            active={mode === id}
            title={t((m) => m.board.modeAllPadsTitle(label))}
            label={t((m) => m.board.modeApplyAllLabel(label))}
            onClick={() => onSetGlobalMode(id)}
          >
            <Icon className="size-[45%]" />
          </RoundControl>,
        );
        continue;
      }

      cells.push(spacer(`r${r}-${c}`));
    }
  }

  return (
    <div className="relative h-full w-full">
      <div
        ref={ref}
        className="grid h-full w-full gap-[1.5%]"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        }}
      >
        {cells}
      </div>

      {/* Over the beat field (below the top lane, left of the right lane);
          clicks pass through to the pads except on the button. */}
      {empty && (
        <div
          className="pointer-events-none absolute bottom-0 left-0 flex items-center justify-center p-[6%]"
          style={{ top: `${100 / ROWS}%`, right: `${100 / COLS}%` }}
        >
          <div className="glass edge-panel relative flex max-w-90 flex-col items-center gap-1 rounded-(--radius-panel) px-(--space-3) py-(--space-4) text-center shadow-floating">
            <h2 className="title">{t((m) => m.board.emptyTitle)}</h2>
            <p className="text-text-subtle">{t((m) => m.board.emptyBody)}</p>
            <Button className="pointer-events-auto mt-(--space-2)" onClick={onOpenPack}>
              {t((m) => m.board.openPack)}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
