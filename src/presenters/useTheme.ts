import { useEffect } from "react";

import { resolveTheme } from "@/model/domain/theme";
import { useSettingsStore } from "@/model/store/settingsStore";

/**
 * Applies the theme preference to the document as `data-theme`. `system`
 * follows the OS and reacts to OS theme changes; `dark`/`light`/`gold` force it.
 */
export function useTheme(): void {
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme = resolveTheme(theme, media.matches);
    };
    apply();
    if (theme === "system") {
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    }
  }, [theme]);
}
