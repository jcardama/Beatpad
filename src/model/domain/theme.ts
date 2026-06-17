/** Theme preference. `system` follows the OS; the settings panel lets the user
 *  override it. */
export type Theme = "system" | "dark" | "light";

export const THEMES: readonly Theme[] = ["system", "dark", "light"];
export const DEFAULT_THEME: Theme = "system";
