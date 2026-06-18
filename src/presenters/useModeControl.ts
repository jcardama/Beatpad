import { useCallback } from "react";

import { type PadMode } from "@/model/domain/pad";
import { setAllPadModes } from "@/model/ipc/commands";
import { useTransportStore } from "@/model/store/transportStore";

/**
 * The global play-mode selector: applies one mode to every pad at once. Per-pad
 * overrides still happen through each pad's right-click menu.
 */
export function useModeControl() {
  const mode = useTransportStore((s) => s.globalMode);
  const setGlobalMode = useTransportStore((s) => s.setGlobalMode);

  const setMode = useCallback(
    (next: PadMode) => {
      setGlobalMode(next); // optimistic
      setAllPadModes(next);
    },
    [setGlobalMode],
  );

  return { mode, setMode };
}
