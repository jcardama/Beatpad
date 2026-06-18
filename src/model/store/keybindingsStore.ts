import { create } from "zustand";

import {
  defaultKeybindings,
  padKeyCount,
  type Keybindings,
  type KeyScheme,
} from "@/model/domain/keybindings";
import type { PadMode } from "@/model/domain/pad";

interface KeybindingsState {
  keybindings: Keybindings;
  setScheme: (scheme: KeyScheme) => void;
  assignPadKey: (index: number, code: string) => void;
  assignBankKey: (code: string) => void;
  assignModeKey: (mode: PadMode, code: string) => void;
  reset: () => void;
  setKeybindings: (keybindings: Keybindings) => void;
}

/** Remove a code from every slot, so a key binds to at most one thing. */
function stealCode(kb: Keybindings, code: string): Keybindings {
  return {
    ...kb,
    padKeys: kb.padKeys.map((c) => (c === code ? "" : c)),
    bankKey: kb.bankKey === code ? "" : kb.bankKey,
    modeKeys: {
      one_shot: kb.modeKeys.one_shot === code ? "" : kb.modeKeys.one_shot,
      hold_loop: kb.modeKeys.hold_loop === code ? "" : kb.modeKeys.hold_loop,
      toggle_loop: kb.modeKeys.toggle_loop === code ? "" : kb.modeKeys.toggle_loop,
    },
  };
}

export const useKeybindingsStore = create<KeybindingsState>((set) => ({
  keybindings: defaultKeybindings("banked"),
  setScheme: (scheme) =>
    set((s) => {
      if (s.keybindings.scheme === scheme) return {};
      // Resize the key list, preserving overlapping slots.
      const count = padKeyCount(scheme);
      const old = s.keybindings.padKeys;
      const padKeys = Array.from({ length: count }, (_, i) => old[i] ?? "");
      return { keybindings: { ...s.keybindings, scheme, padKeys } };
    }),
  assignPadKey: (index, code) =>
    set((s) => {
      const kb = stealCode(s.keybindings, code);
      const padKeys = kb.padKeys.slice();
      padKeys[index] = code;
      return { keybindings: { ...kb, padKeys } };
    }),
  assignBankKey: (code) =>
    set((s) => ({
      keybindings: { ...stealCode(s.keybindings, code), bankKey: code },
    })),
  assignModeKey: (mode, code) =>
    set((s) => {
      const kb = stealCode(s.keybindings, code);
      return {
        keybindings: { ...kb, modeKeys: { ...kb.modeKeys, [mode]: code } },
      };
    }),
  reset: () =>
    set((s) => ({ keybindings: defaultKeybindings(s.keybindings.scheme) })),
  setKeybindings: (keybindings) => set({ keybindings }),
}));
