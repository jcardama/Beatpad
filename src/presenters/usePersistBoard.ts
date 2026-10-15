import { useEffect, useRef } from "react";

import { DEFAULT_MODE, PAD_COUNT, type PadMode } from "@/model/domain/pad";
import { restoreBoard, type SavedPad } from "@/model/ipc/commands";
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
        const pads: SavedPad[] = [];
        for (let pad = 0; pad < PAD_COUNT; pad++) {
          const path = saved.paths[pad];
          if (path) pads.push({ pad, path, mode: modes[pad] || DEFAULT_MODE });
        }
        let loaded: SavedPad[] = [];
        try {
          loaded = await restoreBoard(pads);
        } catch {
          // An unavailable backend must not prevent settings hydration.
        }
        if (restored.length) store.setModes(restored);
        if (loaded.length) store.setPaths(loaded);
      }
      hydrated.current = true;
    })();
  }, []);

  useEffect(() => {
    if (hydrated.current) void saveSetting("board", { paths, modes });
  }, [paths, modes]);
}
