import { en, type Messages } from "./en";
import { es } from "./es";

export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const MESSAGES: Record<Locale, Messages> = { en, es };

/** Best-effort match of the OS/browser language to a supported locale. */
export function detectLocale(): Locale {
  const lang =
    typeof navigator !== "undefined" ? navigator.language.toLowerCase() : "";
  return lang.startsWith("es") ? "es" : DEFAULT_LOCALE;
}

/** Coerce a persisted value into a supported locale. */
export function normalizeLocale(raw: unknown): Locale {
  return LOCALES.includes(raw as Locale) ? (raw as Locale) : detectLocale();
}

export type { Messages };
