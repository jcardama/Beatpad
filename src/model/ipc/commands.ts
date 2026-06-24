import { PAD_COUNT, type PadId, type PadMode } from "@/model/domain/pad";
import type { Theme } from "@/model/domain/theme";
import { ipc } from "./client";

/** Typed wrappers over the Rust `#[tauri::command]`s. */
export const triggerPad = (pad: PadId): Promise<void> =>
  ipc.invoke("trigger_pad", { pad });

export const releasePad = (pad: PadId): Promise<void> =>
  ipc.invoke("release_pad", { pad });

export const setPadMode = (pad: PadId, mode: PadMode): Promise<void> =>
  ipc.invoke("set_pad_mode", { pad, mode });

/** Apply one play mode to every pad (the global mode selector). */
export const setAllPadModes = (mode: PadMode): void => {
  for (let pad = 0; pad < PAD_COUNT; pad++) void setPadMode(pad, mode);
};

/** Load (or replace) a single pad's sound from a file on disk. */
export const loadPadSound = (pad: PadId, path: string): Promise<void> =>
  ipc.invoke("load_pad_sound", { pad, path });

/** A pad filled by a `.beat` pack, with the mode the pack assigned it. */
export interface LoadedPad {
  pad: PadId;
  mode: PadMode;
}

/** Load a `.beat` pack, replacing the board. Resolves with the filled pads. */
export const loadBeatPack = (path: string): Promise<LoadedPad[]> =>
  ipc.invoke<LoadedPad[]>("load_beat_pack", { path });

/** Remove a single pad's sound. */
export const clearPad = (pad: PadId): Promise<void> =>
  ipc.invoke("clear_pad", { pad });

/** Stop every running loop at once (panic). */
export const stopAll = (): Promise<void> => ipc.invoke("stop_all");

/** Manifest fields supplied when saving a board to a `.beat`. */
export interface SaveMeta {
  name: string;
  author: string;
  bpm: number;
}

/** Write the current board to a `.beat` archive. `modes` is indexed by pad. */
export const saveBeat = (
  path: string,
  meta: SaveMeta,
  modes: PadMode[],
): Promise<void> => ipc.invoke("save_beat", { path, meta, modes });

/** The OS account login name — the default (editable) pack author. */
export const systemUsername = (): Promise<string> =>
  ipc.invoke<string>("system_username");

/** Show or hide the native menu bar (the UI owns + persists the state). */
export const setMenuBarVisible = (visible: boolean): Promise<void> =>
  ipc.invoke("set_menu_visible", { visible });

/** Enable/disable the board-dependent menu items (File → Close, Edit → Clear). */
export const setBoardEnabled = (enabled: boolean): Promise<void> =>
  ipc.invoke("set_board_enabled", { enabled });

/** Payload of the `loop-changed` event the engine emits when a pad loops/stops. */
export interface LoopChanged {
  pad: PadId;
  looping: boolean;
}

export const onLoopChanged = (handler: (e: LoopChanged) => void) =>
  ipc.listen<LoopChanged>("loop-changed", handler);

/** Payload of `sound-changed`: a pad gained or lost a loaded sample. */
export interface SoundChanged {
  pad: PadId;
  loaded: boolean;
}

export const onSoundChanged = (handler: (e: SoundChanged) => void) =>
  ipc.listen<SoundChanged>("sound-changed", handler);

/** Payload of `sound-load-failed`: a sample failed to decode on the audio thread. */
export interface SoundLoadFailed {
  pad: PadId;
  error: string;
}

export const onSoundLoadFailed = (handler: (e: SoundLoadFailed) => void) =>
  ipc.listen<SoundLoadFailed>("sound-load-failed", handler);

/** Result of an update check (mirrors the Rust `UpdateStatus`). */
export type UpdateStatus =
  | { kind: "available"; latest: string }
  | { kind: "upToDate"; current: string }
  | { kind: "failed" };

/** Ask GitHub whether a newer release exists (runs off the UI thread). */
export const checkForUpdates = (): Promise<UpdateStatus> =>
  ipc.invoke<UpdateStatus>("check_for_updates");

/** Open the releases page (only when the user opts in from the prompt). */
export const openReleasesPage = (): Promise<void> =>
  ipc.invoke("open_releases_page");

/** A newer release was found by the background checker; payload is its tag. */
export const onUpdateAvailable = (handler: (latest: string) => void) =>
  ipc.listen<string>("update:available", handler);

/** Native menu events. */
export const onMenuOpenPack = (handler: () => void) =>
  ipc.listen<null>("menu:open-pack", () => handler());

export const onMenuSave = (handler: () => void) =>
  ipc.listen<null>("menu:save", () => handler());

export const onMenuSaveAs = (handler: () => void) =>
  ipc.listen<null>("menu:save-as", () => handler());

export const onMenuCheckUpdates = (handler: () => void) =>
  ipc.listen<null>("menu:check-updates", () => handler());

export const onMenuClearBoard = (handler: () => void) =>
  ipc.listen<null>("menu:clear-board", () => handler());

export const onMenuPreferences = (handler: () => void) =>
  ipc.listen<null>("menu:preferences", () => handler());

export const onMenuTheme = (handler: (theme: Theme) => void) =>
  ipc.listen<Theme>("menu:theme", handler);
