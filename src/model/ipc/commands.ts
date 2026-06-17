import type { PadId, PadMode } from "@/model/domain/pad";
import { ipc } from "./client";

/** Typed wrappers over the Rust `#[tauri::command]`s. */
export const triggerPad = (pad: PadId): Promise<void> =>
  ipc.invoke("trigger_pad", { pad });

export const releasePad = (pad: PadId): Promise<void> =>
  ipc.invoke("release_pad", { pad });

export const setPadMode = (pad: PadId, mode: PadMode): Promise<void> =>
  ipc.invoke("set_pad_mode", { pad, mode });

/** Payload of the `loop-changed` event the engine emits when a pad loops/stops. */
export interface LoopChanged {
  pad: PadId;
  looping: boolean;
}

export const onLoopChanged = (handler: (e: LoopChanged) => void) =>
  ipc.listen<LoopChanged>("loop-changed", handler);
