import { create } from "zustand";

import { DEFAULT_THEME, type Theme } from "@/model/domain/theme";

interface SettingsState {
  /** Whether the settings panel is open. */
  open: boolean;
  theme: Theme;
  /** Pack author stamped into saved `.beat` files (defaults to the OS login). */
  author: string;
  /** Whether the native menu bar is shown (Alt toggles it); persisted. */
  menuVisible: boolean;
  setOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
  setAuthor: (author: string) => void;
  setMenuVisible: (visible: boolean) => void;
}

/** User preferences + settings-panel UI state. Persistence (via the store
 *  plugin) is wired in `usePersistSettings`. */
export const useSettingsStore = create<SettingsState>((set) => ({
  open: false,
  theme: DEFAULT_THEME,
  author: "",
  menuVisible: false,
  setOpen: (open) => set({ open }),
  setTheme: (theme) => set({ theme }),
  setAuthor: (author) => set({ author }),
  setMenuVisible: (menuVisible) => set({ menuVisible }),
}));
