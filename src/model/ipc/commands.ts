import type { PadId } from "@/model/domain/pad";
import { ipc } from "./client";

/** Typed wrappers over the Rust `#[tauri::command]`s. */
export const triggerPad = (pad: PadId): Promise<void> =>
  ipc.invoke("trigger_pad", { pad });

export const releasePad = (pad: PadId): Promise<void> =>
  ipc.invoke("release_pad", { pad });
