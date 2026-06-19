import { useEffect } from "react";

import { setMenuBarVisible } from "@/model/ipc/commands";
import { useSettingsStore } from "@/model/store/settingsStore";

/**
 * Toggles the native menu bar on an Alt *tap* (press + release with nothing in
 * between), matching the common Windows/Linux convention. Alt used as part of a
 * shortcut does not toggle. Disabled while settings is open (so Alt can be
 * rebound). The visibility lives in the store (persisted) and is mirrored onto
 * the native menu here, so it survives restarts.
 */
export function useMenuToggle(): void {
  const settingsOpen = useSettingsStore((s) => s.open);
  const menuVisible = useSettingsStore((s) => s.menuVisible);

  // Mirror the (persisted) visibility onto the native menu bar.
  useEffect(() => {
    void setMenuBarVisible(menuVisible);
  }, [menuVisible]);

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
        if (altHeld && !usedChord) {
          const s = useSettingsStore.getState();
          s.setMenuVisible(!s.menuVisible);
        }
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
