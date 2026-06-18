import type { Messages } from "./en";

/** Spanish message catalog. */
export const es: Messages = {
  board: {
    logoAlt: "BeatPad",
    padLabel: (n) => `Pad ${n}`,
    switchBankTitle: (bank) =>
      bank === "top"
        ? "Mitad superior activa — Tab para cambiar"
        : "Mitad inferior activa — Tab para cambiar",
    switchBankLabel: (bank) =>
      bank === "top"
        ? "Cambiar banco (mitad superior activa)"
        : "Cambiar banco (mitad inferior activa)",
    modeAllPadsTitle: (mode) => `${mode} (todos los pads)`,
    modeApplyAllLabel: (mode) => `${mode} — aplicar a todos los pads`,
  },
  mode: {
    one_shot: "Un disparo",
    hold_loop: "Bucle mantenido",
    toggle_loop: "Bucle alternado",
  },
  pad: {
    loadSound: "Cargar sonido…",
    changeSound: "Cambiar sonido…",
    clearSound: "Quitar sonido",
  },
  theme: {
    system: "Sistema",
    dark: "Oscuro",
    light: "Claro",
  },
  scheme: {
    banked: "Por bancos (32)",
    direct: "Directo (64)",
  },
  language: {
    label: "Idioma",
    en: "English",
    es: "Español",
  },
  settings: {
    title: "Ajustes",
    description: "Apariencia y asignaciones de teclado.",
    appearance: "Apariencia",
    theme: "Tema",
    keybindings: "Atajos de teclado",
    resetToDefaults: "Restablecer",
    keyLayout: "Distribución de teclas",
    helpBanked:
      "32 teclas tocan una mitad; la tecla de banco alterna las mitades. Haz clic en una tecla y luego pulsa la nueva. Esc cancela.",
    helpDirect:
      "Una tecla por pad (para teclados grandes o un Launchpad MIDI). Haz clic en una tecla y luego pulsa la nueva. Esc cancela.",
    padsOneBank: "Pads (una mitad)",
    pads: "Pads",
    switchBank: "Cambiar banco",
  },
  keyRecorder: {
    recording: "Pulsa una tecla… (Esc para cancelar)",
    rebind: "Haz clic para reasignar",
  },
  dialog: {
    loadSoundError: (error) => `No se pudo cargar ese sonido.\n${error}`,
    packNoSounds: "Ese pack no tenía sonidos para esta cuadrícula.",
    loadPackError: (error) => `No se pudo cargar ese pack.\n${error}`,
    soundLoadFailed: (pad, error) =>
      `Pad ${pad}: no se pudo reproducir ese sonido.\n${error}`,
  },
};
