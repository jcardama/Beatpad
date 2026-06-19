import { useCallback, useRef } from "react";

import { PAD_COUNT, type PadId, type PadMode } from "@/model/domain/pad";
import {
  clearPad,
  loadBeatPack,
  loadPadSound,
  setPadMode,
} from "@/model/ipc/commands";
import { pickBeatPack, pickSoundFile } from "@/model/ipc/dialog";
import { useBeatFileStore } from "@/model/store/beatFileStore";
import { useToastStore } from "@/model/store/toastStore";
import { useTransportStore } from "@/model/store/transportStore";
import { useT } from "@/presenters/useT";

/**
 * Per-pad actions surfaced by the pad context menu: set a pad's play mode,
 * change or clear its sound, and load a whole `.beat` pack.
 */
export function usePadActions() {
  const storeSetMode = useTransportStore((s) => s.setPadMode);
  const setModes = useTransportStore((s) => s.setModes);
  const resetModes = useTransportStore((s) => s.resetModes);
  const setPath = useTransportStore((s) => s.setPath);
  const resetPaths = useTransportStore((s) => s.resetPaths);
  const setBeatPath = useBeatFileStore((s) => s.setPath);
  const toast = useToastStore((s) => s.show);
  const t = useT();

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
        if (!path) return;
        try {
          await loadPadSound(pad, path);
          setPath(pad, path);
        } catch (e) {
          toast({
            variant: "error",
            message: t((m) => m.dialog.loadSoundError(String(e))),
          });
        }
      }),
    [withDialog, setPath, toast, t],
  );

  const clearSound = useCallback(
    (pad: PadId) => {
      void clearPad(pad);
      setPath(pad, null);
    },
    [setPath],
  );

  const clearBoard = useCallback(() => {
    for (let pad = 0; pad < PAD_COUNT; pad++) void clearPad(pad);
    resetModes();
    resetPaths();
    setBeatPath(null); // a cleared board is a fresh, unsaved document
  }, [resetModes, resetPaths, setBeatPath]);

  const loadPack = useCallback(
    () =>
      withDialog(async () => {
        const path = await pickBeatPack();
        if (!path) return;
        try {
          const filled = await loadBeatPack(path);
          if (filled.length === 0) {
            toast({ variant: "info", message: t((m) => m.dialog.packNoSounds) });
            return; // the board is left untouched
          }
          resetModes(); // the pack replaces the board (only after a good load)
          resetPaths();
          setModes(filled);
          setBeatPath(path); // Save now targets the opened pack
        } catch (e) {
          toast({
            variant: "error",
            message: t((m) => m.dialog.loadPackError(String(e))),
          });
        }
      }),
    [withDialog, resetModes, resetPaths, setModes, setBeatPath, toast, t],
  );

  return { setMode, assignSound, clearSound, clearBoard, loadPack };
}
