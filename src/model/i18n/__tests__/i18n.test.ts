import { describe, expect, it } from "vitest";

import { en } from "../en";
import { es } from "../es";
import { LOCALES, MESSAGES, normalizeLocale } from "../locale";

function keyPaths(obj: object, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    return v && typeof v === "object" ? keyPaths(v, path) : [path];
  });
}

describe("i18n", () => {
  it("every locale catalog has the same key shape as English", () => {
    const reference = keyPaths(en).sort();
    for (const locale of LOCALES) {
      expect(keyPaths(MESSAGES[locale]).sort()).toEqual(reference);
    }
  });

  it("interpolates parameters per locale", () => {
    expect(en.dialog.soundLoadFailed(3, "boom")).toContain("Pad 3");
    expect(es.board.modeAllPadsTitle("Un disparo")).toBe(
      "Un disparo (todos los pads)",
    );
  });

  it("normalizeLocale falls back for unsupported values", () => {
    expect(normalizeLocale("es")).toBe("es");
    expect(normalizeLocale("klingon")).toMatch(/en|es/);
  });
});
