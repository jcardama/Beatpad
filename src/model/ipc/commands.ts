import type { PadId, PadMode } from "@/model/domain/pad";
import { ipc } from "./client";

/** Typed wrappers over the Rust `#[tauri::command]`s. */
export const triggerPad = (pad: PadId): Promise<void> =>
  ipc.invoke("trigger_pad", { pad });

export const releasePad = (pad: PadId): Promise<void> =>
  ipc.invoke("release_pad", { pad });

export const setPadMode = (pad: PadId, mode: PadMode): Promise<void> =>
  ipc.invoke("set_pad_mode", { pad, mode });

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
