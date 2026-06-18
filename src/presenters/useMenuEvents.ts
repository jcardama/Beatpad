import { useEffect } from "react";

import {
  onMenuClearBoard,
  onMenuOpenPack,
  onMenuPreferences,
  onMenuTheme,
} from "@/model/ipc/commands";
import { useSettingsStore } from "@/model/store/settingsStore";

interface Handlers {
  onOpenPack: () => void;
  onClearBoard: () => void;
}

/** Bridges native menu events to app actions. */
export function useMenuEvents({ onOpenPack, onClearBoard }: Handlers): void {
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setOpen = useSettingsStore((s) => s.setOpen);

  useEffect(() => {
    const subs = [
      onMenuOpenPack(onOpenPack),
      onMenuClearBoard(onClearBoard),
      onMenuTheme(setTheme),
      onMenuPreferences(() => setOpen(true)),
    ];
    return () => {
      for (const sub of subs) void sub.then((off) => off());
    };
  }, [onOpenPack, onClearBoard, setTheme, setOpen]);
}
