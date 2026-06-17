import { useEffect } from "react";

import { keyToPad, TAB_KEY, type Bank, type PadId } from "@/model/domain/pad";

interface Handlers {
  press: (pad: PadId) => void;
  release: (pad: PadId) => void;
  bank: Bank;
  toggleBank: () => void;
}

function isEditableTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

/**
 * Binds the keyboard to the active grid bank. Keys resolve via `event.code`
 * (layout-independent), autorepeat is ignored, editable targets are skipped,
 * and TAB flips banks. Any held pads are released on bank switch, window blur,
 * or unmount so a pad never sticks.
 */
export function useKeyboardInput({ press, release, bank, toggleBank }: Handlers): void {
  useEffect(() => {
    const held = new Set<PadId>();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === TAB_KEY) {
        event.preventDefault(); // don't let TAB move focus
        toggleBank();
        return;
      }
      if (event.repeat || isEditableTarget(event.target)) return;
      const pad = keyToPad(event.code, bank);
      if (pad === undefined || held.has(pad)) return;
      held.add(pad);
      press(pad);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const pad = keyToPad(event.code, bank);
      if (pad === undefined) return;
      held.delete(pad);
      release(pad);
    };

    const onBlur = () => {
      held.forEach(release);
      held.clear();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      held.forEach(release); // release everything held in this bank before switching
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [press, release, bank, toggleBank]);
}
