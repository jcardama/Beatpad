import { describe, expect, it } from "vitest";

import { defaultKeybindings, normalizeKeybindings } from "@/model/domain/keybindings";

describe("normalizeKeybindings", () => {
  it("falls back to banked defaults for junk input", () => {
    expect(normalizeKeybindings(null)).toEqual(defaultKeybindings("banked"));
    expect(normalizeKeybindings("nope")).toEqual(defaultKeybindings("banked"));
  });

  it("blanks duplicate codes, keeping the first occurrence", () => {
    const kb = normalizeKeybindings({
      scheme: "banked",
      padKeys: ["KeyA", "KeyA"],
      bankKey: "KeyA",
      modeKeys: { one_shot: "KeyA", hold_loop: "", toggle_loop: "" },
    });
    expect(kb.padKeys[0]).toBe("KeyA");
    expect(kb.padKeys[1]).toBe("");
    expect(kb.bankKey).toBe("");
    expect(kb.modeKeys.one_shot).toBe("");
  });
});
