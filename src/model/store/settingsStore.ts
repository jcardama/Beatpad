import { create } from "zustand";

import { DEFAULT_THEME, type Theme } from "@/model/domain/theme";

interface SettingsState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

/** User preferences. The settings panel edits these; persistence (via the store
 *  plugin) lands with that work. */
export const useSettingsStore = create<SettingsState>((set) => ({
  theme: DEFAULT_THEME,
  setTheme: (theme) => set({ theme }),
}));
