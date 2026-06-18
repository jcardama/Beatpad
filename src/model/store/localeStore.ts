import { create } from "zustand";

import { detectLocale, type Locale } from "@/model/i18n/locale";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

/** The active UI language. Defaults to the OS language; persisted and
 *  overridable in the settings panel. */
export const useLocaleStore = create<LocaleState>((set) => ({
  locale: detectLocale(),
  setLocale: (locale) => set({ locale }),
}));
