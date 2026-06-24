import type { Bank, PadMode } from "@/model/domain/pad";

/** English message catalog. Its shape defines the [`Messages`] contract every
 *  other locale must satisfy. */
export const en = {
  board: {
    logoAlt: "BeatPad",
    padLabel: (n: number): string => `Pad ${n}`,
    switchBankTitle: (bank: Bank): string =>
      bank === "top"
        ? "Top half active — Tab to switch"
        : "Bottom half active — Tab to switch",
    switchBankLabel: (bank: Bank): string =>
      bank === "top"
        ? "Switch bank (Top half active)"
        : "Switch bank (Bottom half active)",
    modeAllPadsTitle: (mode: string): string => `${mode} (all pads)`,
    modeApplyAllLabel: (mode: string): string => `${mode} — apply to all pads`,
  },
  mode: {
    one_shot: "One-shot",
    hold_loop: "Hold loop",
    toggle_loop: "Toggle loop",
  } satisfies Record<PadMode, string>,
  pad: {
    loadSound: "Load sound…",
    changeSound: "Change sound…",
    clearSound: "Clear sound",
  },
  theme: {
    system: "System",
    dark: "Dark",
    light: "Light",
  },
  scheme: {
    banked: "Banked (32)",
    direct: "Direct (64)",
  },
  language: {
    label: "Language",
    en: "English",
    es: "Español",
  },
  settings: {
    title: "Settings",
    description: "Appearance and keyboard mappings.",
    appearance: "Appearance",
    theme: "Theme",
    keybindings: "Keybindings",
    resetToDefaults: "Reset to defaults",
    keyLayout: "Key layout",
    helpBanked:
      "32 keys play one half; the bank key flips halves. Click a key, then press the new one. Esc cancels.",
    helpDirect:
      "One key per pad (for big keyboards or a MIDI Launchpad). Click a key, then press the new one. Esc cancels.",
    padsOneBank: "Pads (one bank)",
    pads: "Pads",
    otherKeys: "Other keys",
    switchBank: "Switch bank",
    stopAll: "Stop all",
    author: "Author",
    authorHint: "Stamped into the packs you save.",
    packs: "Packs",
  },
  keyRecorder: {
    recording: "Press a key… (Esc to cancel)",
    rebind: "Click to rebind",
  },
  dialog: {
    loadSoundError: (error: string): string =>
      `Couldn't load that sound.\n${error}`,
    packNoSounds: "That pack had no sounds for this grid.",
    loadPackError: (error: string): string =>
      `Couldn't load that pack.\n${error}`,
    soundLoadFailed: (pad: number, error: string): string =>
      `Pad ${pad}: couldn't play that sound.\n${error}`,
    saved: "Saved.",
    saveError: (error: string): string => `Couldn't save that pack.\n${error}`,
  },
  update: {
    available: (version: string): string => `BeatPad v${version} is available.`,
    download: "Download",
    upToDate: (version: string): string =>
      `You're on the latest version (v${version}).`,
    checkFailed:
      "Couldn't check for updates. Check your connection and try again.",
  },
  toast: {
    dismiss: "Dismiss",
  },
};

/** The translation contract: the exact shape of the English catalog. */
export type Messages = typeof en;
