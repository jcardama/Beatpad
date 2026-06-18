import { useEffect, useRef } from "react";

import { normalizeKeybindings } from "@/model/domain/keybindings";
import { normalizeLocale } from "@/model/i18n/locale";
import { DEFAULT_THEME, type Theme } from "@/model/domain/theme";
import { loadSetting, saveSetting } from "@/model/ipc/configStore";
import { useKeybindingsStore } from "@/model/store/keybindingsStore";
import { useLocaleStore } from "@/model/store/localeStore";
import { useSettingsStore } from "@/model/store/settingsStore";

/** Loads persisted settings on startup and writes them back on change. */
export function usePersistSettings(): void {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const keybindings = useKeybindingsStore((s) => s.keybindings);
  const setKeybindings = useKeybindingsStore((s) => s.setKeybindings);
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const hydrated = useRef(false);
  // Snapshots taken at mount, so a user edit made before the load resolves
  // (object identity changes on any setter) isn't clobbered by the loaded value.
  const themeAtMount = useRef(useSettingsStore.getState().theme).current;
  const keysAtMount = useRef(useKeybindingsStore.getState().keybindings).current;
  const localeAtMount = useRef(useLocaleStore.getState().locale).current;

  useEffect(() => {
    void Promise.all([
      loadSetting<Theme>("theme", DEFAULT_THEME),
      loadSetting<unknown>("keybindings", null),
      loadSetting<unknown>("locale", null),
    ]).then(([t, kb, loc]) => {
      if (useSettingsStore.getState().theme === themeAtMount) setTheme(t);
      if (useKeybindingsStore.getState().keybindings === keysAtMount)
        setKeybindings(normalizeKeybindings(kb));
      if (loc != null && useLocaleStore.getState().locale === localeAtMount)
        setLocale(normalizeLocale(loc));
      hydrated.current = true;
    });
  }, [setTheme, setKeybindings, setLocale, themeAtMount, keysAtMount, localeAtMount]);

  // Don't clobber stored values before the initial load completes.
  useEffect(() => {
    if (hydrated.current) void saveSetting("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (hydrated.current) void saveSetting("keybindings", keybindings);
  }, [keybindings]);

  useEffect(() => {
    if (hydrated.current) void saveSetting("locale", locale);
  }, [locale]);
}
