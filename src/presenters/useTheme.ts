import { useEffect } from "react";

import { useSettingsStore } from "@/model/store/settingsStore";

/**
 * Applies the theme preference to the document. `system` follows the OS and
 * reacts to OS theme changes; `dark`/`light` force it.
 */
export function useTheme(): void {
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && media.matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    if (theme === "system") {
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    }
  }, [theme]);
}
