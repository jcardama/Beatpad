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
  // Snapshots taken at mount, so a user edit made before the load resolves
  // (object identity changes on any setter) isn't clobbered by the loaded value.
  const themeAtMount = useRef(useSettingsStore.getState().theme).current;
  const keysAtMount = useRef(useKeybindingsStore.getState().keybindings).current;

  useEffect(() => {
    void Promise.all([
      loadSetting<Theme>("theme", DEFAULT_THEME),
      loadSetting<unknown>("keybindings", null),
    ]).then(([t, kb]) => {
      if (useSettingsStore.getState().theme === themeAtMount) setTheme(t);
      if (useKeybindingsStore.getState().keybindings === keysAtMount)
        setKeybindings(normalizeKeybindings(kb));
      hydrated.current = true;
    });
  }, [setTheme, setKeybindings, themeAtMount, keysAtMount]);

  // Don't clobber stored values before the initial load completes.
  useEffect(() => {
    if (hydrated.current) void saveSetting("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (hydrated.current) void saveSetting("keybindings", keybindings);
  }, [keybindings]);
}
