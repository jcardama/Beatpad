/** Linear, row-major pad index. */
export type PadId = number;

/** Mirrors `format::PadMode` on the Rust side. */
export type PadMode = "one_shot" | "hold_loop" | "toggle_loop";

/** Scaffold grid: a 4×4 finger-drumming layout. */
export const GRID = { rows: 4, cols: 4 } as const;
export const PAD_COUNT = GRID.rows * GRID.cols;

/**
 * Physical-key (`KeyboardEvent.code`) → pad index. Keyed on `code` rather than
 * `key` so the mapping is layout-independent (works on AZERTY, etc.).
 */
export const KEY_TO_PAD: Readonly<Record<string, PadId>> = {
  Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3,
  KeyQ: 4, KeyW: 5, KeyE: 6, KeyR: 7,
  KeyA: 8, KeyS: 9, KeyD: 10, KeyF: 11,
  KeyZ: 12, KeyX: 13, KeyC: 14, KeyV: 15,
};

/** Pad face labels, indexed by pad id. */
export const PAD_LABELS: readonly string[] = [
  "1", "2", "3", "4",
  "Q", "W", "E", "R",
  "A", "S", "D", "F",
  "Z", "X", "C", "V",
];
