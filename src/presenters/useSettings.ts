import { useLocaleStore } from "@/model/store/localeStore";
import { useSettingsStore } from "@/model/store/settingsStore";

/** Presentation logic for the settings panel. */
export function useSettings() {
  const open = useSettingsStore((s) => s.open);
  const setOpen = useSettingsStore((s) => s.setOpen);
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const author = useSettingsStore((s) => s.author);
  const setAuthor = useSettingsStore((s) => s.setAuthor);
  return { open, setOpen, theme, setTheme, locale, setLocale, author, setAuthor };
}
