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
    emptyTitle: "Carga tu primer sonido",
    emptyBody:
      "Haz clic derecho en un pad para cargar un sonido o suelta un archivo de audio encima.",
    openPack: "Abrir pack…",
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
    clearTitle: "¿Quitar el sonido de este pad?",
    clearBody: (n, key) =>
      `El pad ${n} (${key}) se queda sin sonido. El archivo de audio sigue en tu ordenador.`,
  },
  theme: {
    system: "Sistema",
    dark: "Oscuro",
    light: "Claro",
    gold: "Dorado",
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
    themeHint: "Personaliza el aspecto de la app.",
    keybindings: "Atajos de teclado",
    resetToDefaults: "Restablecer",
    keyLayout: "Distribución de teclas",
    helpBanked:
      "32 teclas tocan una mitad; la tecla de banco alterna las mitades. Haz clic en una tecla y luego pulsa la nueva. Esc cancela.",
    helpDirect:
      "Una tecla por pad (para teclados grandes o un Launchpad MIDI). Haz clic en una tecla y luego pulsa la nueva. Esc cancela.",
    padsOneBank: "Pads (una mitad)",
    pads: "Pads",
    otherKeys: "Otras teclas",
    switchBank: "Cambiar banco",
    stopAll: "Detener todo",
    author: "Autor",
    authorHint: "Se incluye en los packs que guardas.",
    packs: "Packs",
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
    saved: "Guardado.",
    saveError: (error) => `No se pudo guardar ese pack.\n${error}`,
  },
  update: {
    available: (version) => `BeatPad v${version} ya está disponible.`,
    install: "Instalar",
    installing: "Descargando actualización…",
    installFailed: "No se pudo instalar la actualización. Inténtalo más tarde.",
    upToDate: (version) => `Tienes la última versión (v${version}).`,
    checkFailed:
      "No se pudo comprobar si hay actualizaciones. Revisa tu conexión e inténtalo de nuevo.",
  },
  toast: {
    dismiss: "Cerrar",
  },
  common: {
    cancel: "Cancelar",
    close: "Cerrar",
  },
};
