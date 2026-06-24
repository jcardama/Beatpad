import { useEffect } from "react";

import { keyToPad } from "@/model/domain/keybindings";
import type { Bank, PadId, PadMode } from "@/model/domain/pad";
import { stopAll } from "@/model/ipc/commands";
import { useKeybindingsStore } from "@/model/store/keybindingsStore";
import { useSettingsStore } from "@/model/store/settingsStore";

interface Handlers {
  press: (pad: PadId) => void;
  release: (pad: PadId) => void;
  bank: Bank;
  toggleBank: () => void;
  setGlobalMode: (mode: PadMode) => void;
}

function isEditableTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

/**
 * Binds the keyboard to the active grid bank using the configurable keybindings.
 * Keys resolve via `event.code` (layout-independent); autorepeat is ignored,
 * editable targets skipped, the bank key flips banks, and mode keys switch the
 * global play mode. Disabled while the settings panel is open (so it can capture
 * keys for rebinding). Held pads release on bank switch, blur, or unmount.
 */
export function useKeyboardInput({
  press,
  release,
  bank,
  toggleBank,
  setGlobalMode,
}: Handlers): void {
  const kb = useKeybindingsStore((s) => s.keybindings);
  const settingsOpen = useSettingsStore((s) => s.open);

  useEffect(() => {
    if (settingsOpen) return; // the settings recorder owns the keyboard then
    const held = new Set<PadId>();

    const modeForCode = (code: string): PadMode | undefined => {
      if (!code) return undefined;
      if (code === kb.modeKeys.one_shot) return "one_shot";
      if (code === kb.modeKeys.hold_loop) return "hold_loop";
      if (code === kb.modeKeys.toggle_loop) return "toggle_loop";
      return undefined;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      // Autorepeat must not re-fire bank/mode shortcuts (each mode switch is a
      // 64-pad IPC fan-out) or re-trigger held pads.
      if (event.repeat || isEditableTarget(event.target)) return;
      if (event.code === kb.panicKey) {
        event.preventDefault();
        void stopAll();
        return;
      }
      if (kb.scheme === "banked" && event.code === kb.bankKey) {
        event.preventDefault();
        toggleBank();
        return;
      }
      const mode = modeForCode(event.code);
      if (mode) {
        event.preventDefault();
        setGlobalMode(mode);
        return;
      }
      const pad = keyToPad(event.code, bank, kb);
      if (pad === undefined || held.has(pad)) return;
      held.add(pad);
      press(pad);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      const pad = keyToPad(event.code, bank, kb);
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
      held.forEach(release);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [press, release, bank, toggleBank, setGlobalMode, kb, settingsOpen]);
}
