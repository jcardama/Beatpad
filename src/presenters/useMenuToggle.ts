import { useEffect } from "react";

import { toggleMenu } from "@/model/ipc/commands";
import { useSettingsStore } from "@/model/store/settingsStore";

/**
 * Toggles the native menu bar on an Alt *tap* (press + release with nothing in
 * between), matching the common Windows/Linux convention. Alt used as part of a
 * shortcut does not toggle. Disabled while settings is open (so Alt can be
 * rebound).
 */
export function useMenuToggle(): void {
  const settingsOpen = useSettingsStore((s) => s.open);

  useEffect(() => {
    if (settingsOpen) return;
    let altHeld = false;
    let usedChord = false;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Alt") {
        if (!e.repeat) {
          altHeld = true;
          usedChord = false;
        }
        e.preventDefault();
        return;
      }
      if (altHeld) usedChord = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") {
        if (altHeld && !usedChord) void toggleMenu();
        altHeld = false;
        e.preventDefault();
      }
    };

    const onBlur = () => {
      altHeld = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [settingsOpen]);
}
