/** Linear, row-major pad index (0..PAD_COUNT). */
export type PadId = number;

/** Mirrors `format::PadMode` / `engine::PlayMode` on the Rust side. */
export type PadMode = "one_shot" | "hold_loop" | "toggle_loop";

export const DEFAULT_MODE: PadMode = "one_shot";

/** Selectable play modes, in display order. */
export const PAD_MODES: readonly { id: PadMode; label: string }[] = [
  { id: "one_shot", label: "One-shot" },
  { id: "hold_loop", label: "Hold loop" },
  { id: "toggle_loop", label: "Toggle loop" },
];

/** 8×8 grid, played as two stacked banks of 4 rows each. */
export const GRID = { rows: 8, cols: 8 } as const;
export const PAD_COUNT = GRID.rows * GRID.cols; // 64
export const HALF_ROWS = GRID.rows / 2; // 4

/**
 * The active half of the grid. The 32 physical keys address one bank at a time;
 * TAB flips between them.
 */
export type Bank = "top" | "bottom";
export const DEFAULT_BANK: Bank = "top";
export const TAB_KEY = "Tab";

const BANK_ROW_OFFSET: Record<Bank, number> = { top: 0, bottom: HALF_ROWS };

/** The 4×8 physical key layout, by `KeyboardEvent.code` (layout-independent). */
const KEY_ROWS: readonly (readonly string[])[] = [
  ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8"],
  ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI"],
  ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK"],
  ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma"],
];

/** Display labels matching `KEY_ROWS`. */
const KEY_LABELS: readonly (readonly string[])[] = [
  ["1", "2", "3", "4", "5", "6", "7", "8"],
  ["Q", "W", "E", "R", "T", "Y", "U", "I"],
  ["A", "S", "D", "F", "G", "H", "J", "K"],
  ["Z", "X", "C", "V", "B", "N", "M", ","],
];

const KEY_POS: ReadonlyMap<string, [number, number]> = new Map(
  KEY_ROWS.flatMap((row, r) => row.map((code, c) => [code, [r, c]] as const)),
);

/** Resolve a physical key to the pad it fires in the active bank. */
export function keyToPad(code: string, bank: Bank): PadId | undefined {
  const pos = KEY_POS.get(code);
  if (!pos) return undefined;
  const [r, c] = pos;
  return (BANK_ROW_OFFSET[bank] + r) * GRID.cols + c;
}

/** Which bank a pad belongs to (top = rows 0–3, bottom = rows 4–7). */
export function padBank(pad: PadId): Bank {
  return Math.floor(pad / GRID.cols) < HALF_ROWS ? "top" : "bottom";
}

/** The key label that fires a pad when its bank is active. Repeats per half. */
export function padLabel(pad: PadId): string {
  const row = Math.floor(pad / GRID.cols) % HALF_ROWS;
  const col = pad % GRID.cols;
  return KEY_LABELS[row][col];
}
