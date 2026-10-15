/** Theme preference. `system` follows the OS; `dark`/`light`/`gold` force it. */
export type Theme = "system" | "dark" | "light" | "gold";

export const THEMES: readonly Theme[] = ["system", "dark", "light", "gold"];
export const DEFAULT_THEME: Theme = "system";
