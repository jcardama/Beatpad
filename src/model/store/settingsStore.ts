import { create } from "zustand";

import { DEFAULT_THEME, type Theme } from "@/model/domain/theme";

interface SettingsState {
  /** Whether the settings panel is open. */
  open: boolean;
  theme: Theme;
  setOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
}

/** User preferences + settings-panel UI state. Persistence (via the store
 *  plugin) is wired in `usePersistSettings`. */
export const useSettingsStore = create<SettingsState>((set) => ({
  open: false,
  theme: DEFAULT_THEME,
  setOpen: (open) => set({ open }),
  setTheme: (theme) => set({ theme }),
}));
