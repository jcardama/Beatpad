import { useEffect, useRef } from "react";

import { normalizeKeybindings } from "@/model/domain/keybindings";
import { normalizeLocale } from "@/model/i18n/locale";
import { DEFAULT_THEME, type Theme } from "@/model/domain/theme";
import { systemUsername } from "@/model/ipc/commands";
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
  const author = useSettingsStore((s) => s.author);
  const setAuthor = useSettingsStore((s) => s.setAuthor);
  const menuVisible = useSettingsStore((s) => s.menuVisible);
  const setMenuVisible = useSettingsStore((s) => s.setMenuVisible);
  const hydrated = useRef(false);
  // Snapshots taken at mount, so a user edit made before the load resolves
  // (object identity changes on any setter) isn't clobbered by the loaded value.
  const themeAtMount = useRef(useSettingsStore.getState().theme).current;
  const keysAtMount = useRef(useKeybindingsStore.getState().keybindings).current;
  const localeAtMount = useRef(useLocaleStore.getState().locale).current;
  const authorAtMount = useRef(useSettingsStore.getState().author).current;
  const menuAtMount = useRef(useSettingsStore.getState().menuVisible).current;

  useEffect(() => {
    void Promise.all([
      loadSetting<Theme>("theme", DEFAULT_THEME),
      loadSetting<unknown>("keybindings", null),
      loadSetting<unknown>("locale", null),
      loadSetting<string | null>("author", null),
      loadSetting<boolean | null>("menuVisible", null),
    ]).then(async ([t, kb, loc, savedAuthor, savedMenu]) => {
      if (useSettingsStore.getState().theme === themeAtMount) setTheme(t);
      if (useKeybindingsStore.getState().keybindings === keysAtMount)
        setKeybindings(normalizeKeybindings(kb));
      if (loc != null && useLocaleStore.getState().locale === localeAtMount)
        setLocale(normalizeLocale(loc));
      // First run only (null): seed the author from the OS login name (never
      // the real name). A deliberately-cleared "" is respected, not re-seeded.
      const a = savedAuthor ?? (await systemUsername().catch(() => ""));
      if (useSettingsStore.getState().author === authorAtMount) setAuthor(a);
      if (
        savedMenu != null &&
        useSettingsStore.getState().menuVisible === menuAtMount
      )
        setMenuVisible(savedMenu);
      hydrated.current = true;
    });
  }, [
    setTheme,
    setKeybindings,
    setLocale,
    setAuthor,
    setMenuVisible,
    themeAtMount,
    keysAtMount,
    localeAtMount,
    authorAtMount,
    menuAtMount,
  ]);

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

  useEffect(() => {
    if (hydrated.current) void saveSetting("author", author);
  }, [author]);

  useEffect(() => {
    if (hydrated.current) void saveSetting("menuVisible", menuVisible);
  }, [menuVisible]);
}
