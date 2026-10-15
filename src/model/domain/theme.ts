/** Theme preference. `system` follows the OS; `dark`/`light`/`gold` force it. */
export type Theme = "system" | "dark" | "light" | "gold";

/** A theme the document can actually render (`system` resolved). */
export type ResolvedTheme = Exclude<Theme, "system">;

export const THEMES: readonly Theme[] = ["system", "dark", "light", "gold"];
export const DEFAULT_THEME: Theme = "system";

export function resolveTheme(theme: Theme, prefersDark: boolean): ResolvedTheme {
  if (theme !== "system") return theme;
  return prefersDark ? "dark" : "light";
}
