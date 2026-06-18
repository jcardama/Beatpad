import { useEffect, useRef } from "react";

import { normalizeKeybindings } from "@/model/domain/keybindings";
import { DEFAULT_THEME, type Theme } from "@/model/domain/theme";
import { loadSetting, saveSetting } from "@/model/ipc/configStore";
import { useKeybindingsStore } from "@/model/store/keybindingsStore";
import { useSettingsStore } from "@/model/store/settingsStore";

/** Loads persisted settings on startup and writes them back on change. */
export function usePersistSettings(): void {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const keybindings = useKeybindingsStore((s) => s.keybindings);
  const setKeybindings = useKeybindingsStore((s) => s.setKeybindings);
  const hydrated = useRef(false);

  useEffect(() => {
    void Promise.all([
      loadSetting<Theme>("theme", DEFAULT_THEME),
      loadSetting<unknown>("keybindings", null),
    ]).then(([t, kb]) => {
      setTheme(t);
      setKeybindings(normalizeKeybindings(kb));
      hydrated.current = true;
    });
  }, [setTheme, setKeybindings]);

  // Don't clobber stored values before the initial load completes.
  useEffect(() => {
    if (hydrated.current) void saveSetting("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (hydrated.current) void saveSetting("keybindings", keybindings);
  }, [keybindings]);
}
