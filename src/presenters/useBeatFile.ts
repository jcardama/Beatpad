import { useEffect } from "react";

import { onMenuSave, onMenuSaveAs, saveBeat } from "@/model/ipc/commands";
import { pickSaveBeat } from "@/model/ipc/dialog";
import { useBeatFileStore } from "@/model/store/beatFileStore";
import { useSettingsStore } from "@/model/store/settingsStore";
import { useToastStore } from "@/model/store/toastStore";
import { useTransportStore } from "@/model/store/transportStore";
import { useT } from "@/presenters/useT";

/** Strip the directory and `.beat` extension to a manifest-friendly name. */
function baseName(path: string): string {
  return path.split(/[\\/]/).pop()?.replace(/\.beat$/i, "") ?? "Untitled";
}

/**
 * Handles File → Save / Save As. "Save" writes to the bound `.beat` path (the
 * last opened or saved file); "Save As" — or a board with no bound file —
 * prompts for a destination. Reads live state from the stores so the menu
 * listeners can stay subscribed once.
 */
export function useBeatFile(): void {
  const t = useT();
  const toast = useToastStore((s) => s.show);

  useEffect(() => {
    const run = async (forcePrompt: boolean) => {
      let target = useBeatFileStore.getState().path;
      if (forcePrompt || !target) {
        target = await pickSaveBeat(target ?? "Untitled.beat");
        if (!target) return;
      }
      try {
        const modes = useTransportStore.getState().modes;
        const author = useSettingsStore.getState().author;
        await saveBeat(target, { name: baseName(target), author, bpm: 120 }, modes);
        useBeatFileStore.getState().setPath(target);
        toast({ variant: "info", message: t((m) => m.dialog.saved) });
      } catch (e) {
        toast({ variant: "error", message: t((m) => m.dialog.saveError(String(e))) });
      }
    };

    const offSave = onMenuSave(() => void run(false));
    const offSaveAs = onMenuSaveAs(() => void run(true));
    return () => {
      void offSave.then((off) => off());
      void offSaveAs.then((off) => off());
    };
  }, [t, toast]);
}
