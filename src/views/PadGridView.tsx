import { GRID, type PadId } from "@/model/domain/pad";
import type { PadVm } from "@/presenters/usePadGrid";
import { PadView } from "./PadView";

interface Props {
  pads: PadVm[];
  onPress: (pad: PadId) => void;
  onRelease: (pad: PadId) => void;
}

/** Presentational grid. */
export function PadGridView({ pads, onPress, onRelease }: Props) {
  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${GRID.cols}, minmax(0, 1fr))` }}
    >
      {pads.map((pad) => (
        <PadView
          key={pad.id}
          pad={pad}
          onPress={onPress}
          onRelease={onRelease}
        />
      ))}
    </div>
  );
}
