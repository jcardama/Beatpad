import { useKeybindingsStore } from "@/model/store/keybindingsStore";

/** Presentation logic for the keybindings editor. */
export function useKeybindings() {
  const keybindings = useKeybindingsStore((s) => s.keybindings);
  const setScheme = useKeybindingsStore((s) => s.setScheme);
  const assignPadKey = useKeybindingsStore((s) => s.assignPadKey);
  const assignBankKey = useKeybindingsStore((s) => s.assignBankKey);
  const assignModeKey = useKeybindingsStore((s) => s.assignModeKey);
  const assignPanicKey = useKeybindingsStore((s) => s.assignPanicKey);
  const reset = useKeybindingsStore((s) => s.reset);
  return {
    keybindings,
    setScheme,
    assignPadKey,
    assignBankKey,
    assignModeKey,
    assignPanicKey,
    reset,
  };
}
