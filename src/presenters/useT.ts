import { useCallback } from "react";

import { MESSAGES, type Messages } from "@/model/i18n/locale";
import { useLocaleStore } from "@/model/store/localeStore";

/** A translation lookup bound to the active locale: `t((m) => m.settings.title)`.
 *  The selector returns the final string, so interpolated entries are called
 *  inline — `t((m) => m.board.padLabel(3))`. */
export function useT(): (select: (m: Messages) => string) => string {
  const locale = useLocaleStore((s) => s.locale);
  return useCallback((select) => select(MESSAGES[locale]), [locale]);
}
