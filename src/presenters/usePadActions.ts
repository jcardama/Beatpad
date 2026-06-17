import { useCallback, useRef } from "react";

import { PAD_COUNT, type PadId, type PadMode } from "@/model/domain/pad";
import {
  clearPad,
  loadBeatPack,
  loadPadSound,
  setPadMode,
} from "@/model/ipc/commands";
import { pickBeatPack, pickSoundFile } from "@/model/ipc/dialog";
import { useTransportStore } from "@/model/store/transportStore";

/**
 * Per-pad actions surfaced by the pad context menu: set a pad's play mode,
 * change or clear its sound, and load a whole `.beat` pack.
 */
export function usePadActions() {
  const storeSetMode = useTransportStore((s) => s.setPadMode);
  const setModes = useTransportStore((s) => s.setModes);
  const resetModes = useTransportStore((s) => s.resetModes);

  // Only one native file dialog may be open at a time across all actions.
  const dialogOpen = useRef(false);
  const withDialog = useCallback(async (run: () => Promise<void>) => {
    if (dialogOpen.current) return;
    dialogOpen.current = true;
    try {
      await run();
    } finally {
      dialogOpen.current = false;
    }
  }, []);

  const setMode = useCallback(
    (pad: PadId, mode: PadMode) => {
      storeSetMode(pad, mode); // optimistic
      void setPadMode(pad, mode);
    },
    [storeSetMode],
  );

  const assignSound = useCallback(
    (pad: PadId) =>
      withDialog(async () => {
        const path = await pickSoundFile();
        if (path) await loadPadSound(pad, path);
      }),
    [withDialog],
  );

  const clearSound = useCallback((pad: PadId) => {
    void clearPad(pad);
  }, []);

  const clearBoard = useCallback(() => {
    for (let pad = 0; pad < PAD_COUNT; pad++) void clearPad(pad);
    resetModes();
  }, [resetModes]);

  const loadPack = useCallback(
    () =>
      withDialog(async () => {
        const path = await pickBeatPack();
        if (!path) return;
        resetModes(); // the pack replaces the board
        const filled = await loadBeatPack(path);
        setModes(filled);
      }),
    [withDialog, resetModes, setModes],
  );

  return { setMode, assignSound, clearSound, clearBoard, loadPack };
}
