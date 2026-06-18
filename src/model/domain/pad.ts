/** Linear, row-major pad index (0..PAD_COUNT). */
export type PadId = number;

/** Mirrors `format::PadMode` / `engine::PlayMode` on the Rust side. */
export type PadMode = "one_shot" | "hold_loop" | "toggle_loop";

export const DEFAULT_MODE: PadMode = "one_shot";

/** Selectable play modes, in display order. Labels live in the i18n catalog. */
export const PAD_MODES: readonly PadMode[] = [
  "one_shot",
  "hold_loop",
  "toggle_loop",
];

/** 8×8 grid, played as two stacked banks of 4 rows each. */
export const GRID = { rows: 8, cols: 8 } as const;
export const PAD_COUNT = GRID.rows * GRID.cols; // 64
export const HALF_ROWS = GRID.rows / 2; // 4

/**
 * The active half of the grid. The 32 physical keys address one bank at a time;
 * the bank key (default Tab) flips between them. Key bindings live in
 * `domain/keybindings.ts`.
 */
export type Bank = "top" | "bottom";
export const DEFAULT_BANK: Bank = "top";

/** Which bank a pad belongs to (top = rows 0–3, bottom = rows 4–7). */
export function padBank(pad: PadId): Bank {
  return Math.floor(pad / GRID.cols) < HALF_ROWS ? "top" : "bottom";
}
