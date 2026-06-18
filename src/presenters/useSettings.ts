import { useSettingsStore } from "@/model/store/settingsStore";

/** Presentation logic for the settings panel. */
export function useSettings() {
  const open = useSettingsStore((s) => s.open);
  const setOpen = useSettingsStore((s) => s.setOpen);
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  return { open, setOpen, theme, setTheme };
}
