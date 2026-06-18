import {
  GRID,
  HALF_ROWS,
  PAD_COUNT,
  type Bank,
  type PadId,
  type PadMode,
} from "./pad";

/**
 * How keys map to pads:
 * - `banked`: 32 keys address one half of the grid; the bank key flips halves.
 * - `direct`: 64 keys, one per pad (for large keyboards or a MIDI Launchpad).
 */
export type KeyScheme = "banked" | "direct";

export const PAD_KEY_COUNT_BANKED = HALF_ROWS * GRID.cols; // 32
export const PAD_KEY_COUNT_DIRECT = PAD_COUNT; // 64

export function padKeyCount(scheme: KeyScheme): number {
  return scheme === "direct" ? PAD_KEY_COUNT_DIRECT : PAD_KEY_COUNT_BANKED;
}

export interface Keybindings {
  scheme: KeyScheme;
  /** Length is `padKeyCount(scheme)` — 32 (banked) or 64 (direct). */
  padKeys: string[];
  bankKey: string;
  modeKeys: Record<PadMode, string>;
}

export const DEFAULT_BANKED_KEYS: readonly string[] = [
  "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8",
  "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI",
  "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK",
  "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma",
];

/** Default keys for a scheme. Direct reuses the 32 for the top half; the rest
 *  start unbound (a standard keyboard can't comfortably reach 64). */
export function defaultPadKeys(scheme: KeyScheme): string[] {
  if (scheme === "direct") {
    return [
      ...DEFAULT_BANKED_KEYS,
      ...Array(PAD_KEY_COUNT_DIRECT - DEFAULT_BANKED_KEYS.length).fill(""),
    ];
  }
  return [...DEFAULT_BANKED_KEYS];
}

export function defaultKeybindings(scheme: KeyScheme): Keybindings {
  return {
    scheme,
    padKeys: defaultPadKeys(scheme),
    bankKey: "Tab",
    modeKeys: { one_shot: "", hold_loop: "", toggle_loop: "" },
  };
}

export const DEFAULT_KEYBINDINGS: Keybindings = defaultKeybindings("banked");

/** Coerce a loaded/partial value into valid keybindings (handles older saves
 *  that predate the scheme field or have a mismatched key count). */
export function normalizeKeybindings(raw: unknown): Keybindings {
  if (!raw || typeof raw !== "object") return defaultKeybindings("banked");
  const r = raw as Partial<Keybindings>;
  const scheme: KeyScheme = r.scheme === "direct" ? "direct" : "banked";
  const fallback = defaultPadKeys(scheme);
  const source = Array.isArray(r.padKeys) ? r.padKeys : fallback;
  const padKeys = Array.from(
    { length: padKeyCount(scheme) },
    (_, i) => source[i] ?? "",
  );
  return dedupeCodes({
    scheme,
    padKeys,
    bankKey: typeof r.bankKey === "string" ? r.bankKey : "Tab",
    modeKeys: {
      one_shot: r.modeKeys?.one_shot ?? "",
      hold_loop: r.modeKeys?.hold_loop ?? "",
      toggle_loop: r.modeKeys?.toggle_loop ?? "",
    },
  });
}

/** Enforce the editor's invariant — each code binds at most one slot — on
 *  hand-edited saves. First occurrence (pads, then bank, then modes) wins;
 *  later duplicates are blanked. */
function dedupeCodes(kb: Keybindings): Keybindings {
  const seen = new Set<string>();
  const keep = (code: string): string => {
    if (!code || seen.has(code)) return "";
    seen.add(code);
    return code;
  };
  return {
    ...kb,
    padKeys: kb.padKeys.map(keep),
    bankKey: keep(kb.bankKey),
    modeKeys: {
      one_shot: keep(kb.modeKeys.one_shot),
      hold_loop: keep(kb.modeKeys.hold_loop),
      toggle_loop: keep(kb.modeKeys.toggle_loop),
    },
  };
}

const BANK_ROW_OFFSET: Record<Bank, number> = { top: 0, bottom: HALF_ROWS };

/** Resolve a physical key to the pad it fires (in the active bank, if banked). */
export function keyToPad(
  code: string,
  bank: Bank,
  kb: Keybindings,
): PadId | undefined {
  if (!code) return undefined;
  const index = kb.padKeys.indexOf(code);
  if (index < 0) return undefined;
  if (kb.scheme === "direct") return index; // one key per pad
  const krow = Math.floor(index / GRID.cols);
  const kcol = index % GRID.cols;
  return (BANK_ROW_OFFSET[bank] + krow) * GRID.cols + kcol;
}

/** The key label shown on a pad. */
export function padLabel(pad: PadId, kb: Keybindings): string {
  if (kb.scheme === "direct") return keyLabel(kb.padKeys[pad] ?? "");
  const krow = Math.floor(pad / GRID.cols) % HALF_ROWS;
  const kcol = pad % GRID.cols;
  return keyLabel(kb.padKeys[krow * GRID.cols + kcol] ?? "");
}

const SPECIAL_LABELS: Record<string, string> = {
  Comma: ",",
  Period: ".",
  Semicolon: ";",
  Slash: "/",
  Backslash: "\\",
  Quote: "'",
  BracketLeft: "[",
  BracketRight: "]",
  Minus: "-",
  Equal: "=",
  Backquote: "`",
  Space: "Space",
  Enter: "Enter",
  Tab: "Tab",
};

/** Friendly label for a `KeyboardEvent.code` (empty code → an em-dash). */
export function keyLabel(code: string): string {
  if (!code) return "—";
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Digit")) return code.slice(5);
  if (code.startsWith("Arrow")) return code.slice(5);
  return SPECIAL_LABELS[code] ?? code;
}
