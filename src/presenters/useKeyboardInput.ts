import { useEffect } from "react";

import { KEY_TO_PAD, type PadId } from "@/model/domain/pad";

interface Handlers {
  press: (pad: PadId) => void;
  release: (pad: PadId) => void;
}

function isEditableTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

/**
 * Binds the keyboard to the pad grid. Keys on `event.code` (layout-independent),
 * ignores autorepeat, skips editable/IME targets, and releases any held pads on
 * window blur so a pad never sticks when focus is lost mid-press.
 */
export function useKeyboardInput({ press, release }: Handlers): void {
  useEffect(() => {
    const held = new Set<PadId>();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || isEditableTarget(event.target)) return;
      const pad = KEY_TO_PAD[event.code];
      if (pad === undefined || held.has(pad)) return;
      held.add(pad);
      press(pad);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const pad = KEY_TO_PAD[event.code];
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
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [press, release]);
}
