import { useEffect, useRef } from "react";

import { PAD_COUNT, type PadMode } from "@/model/domain/pad";
import { loadPadSound, setPadMode } from "@/model/ipc/commands";
import { loadSetting, saveSetting } from "@/model/ipc/configStore";
import { useTransportStore } from "@/model/store/transportStore";

interface PersistedBoard {
  paths: (string | null)[];
  modes: PadMode[];
}

/**
 * Persists individually-assigned pad sounds and per-pad modes, replaying them
 * on startup so the board survives a restart. Pack-loaded sounds aren't
 * path-backed, so they aren't restored here.
 */
export function usePersistBoard(): void {
  const paths = useTransportStore((s) => s.paths);
  const modes = useTransportStore((s) => s.modes);
  const hydrated = useRef(false);

  useEffect(() => {
    void (async () => {
      const saved = await loadSetting<PersistedBoard | null>("board", null);
      if (saved && Array.isArray(saved.paths)) {
        const store = useTransportStore.getState();
        const modes = Array.isArray(saved.modes) ? saved.modes : [];
        const restored = modes
          .map((mode, pad) => ({ pad, mode }))
          .filter(({ mode }) => mode);
        if (restored.length) store.setModes(restored);

        for (let pad = 0; pad < PAD_COUNT; pad++) {
          const path = saved.paths[pad];
          if (!path) continue;
          try {
            await loadPadSound(pad, path); // emits sound-changed → marks loaded
            store.setPath(pad, path);
            const mode = modes[pad];
            if (mode) await setPadMode(pad, mode);
          } catch {
            // File moved or deleted since last run — drop it silently.
          }
        }
      }
      hydrated.current = true;
    })();
  }, []);

  useEffect(() => {
    if (hydrated.current) void saveSetting("board", { paths, modes });
  }, [paths, modes]);
}
