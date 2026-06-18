import { useEffect } from "react";

import { useLocaleStore } from "@/model/store/localeStore";

/** Keeps the document's `lang` attribute in sync with the active locale, so
 *  assistive tech announces content in the right language. */
export function useDocumentLang(): void {
  const locale = useLocaleStore((s) => s.locale);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
}
