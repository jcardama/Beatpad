import { useCallback } from "react";

import { PAD_COUNT, type PadMode } from "@/model/domain/pad";
import { setPadMode } from "@/model/ipc/commands";
import { useTransportStore } from "@/model/store/transportStore";

/**
 * Presentation logic for the global play-mode selector. Applies one mode to
 * every pad (the scaffold has no per-pad mode UI yet) and mirrors it in state.
 */
export function useModeControl() {
  const mode = useTransportStore((s) => s.mode);
  const setStoreMode = useTransportStore((s) => s.setMode);

  const setMode = useCallback(
    (next: PadMode) => {
      setStoreMode(next);
      for (let pad = 0; pad < PAD_COUNT; pad++) void setPadMode(pad, next);
    },
    [setStoreMode],
  );

  return { mode, setMode };
}
