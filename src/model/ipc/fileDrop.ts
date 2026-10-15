import { getCurrentWebview } from "@tauri-apps/api/webview";

/** A file drag over the window, in CSS pixels. `paths` arrives on enter and
 *  drop; plain moves carry only the position. */
export type FileDrop =
  | { kind: "hover"; x: number; y: number; paths?: string[] }
  | { kind: "drop"; x: number; y: number; paths: string[] }
  | { kind: "leave" };

/** Subscribe to OS file drags over the window. */
export function onFileDrop(handler: (e: FileDrop) => void) {
  return getCurrentWebview().onDragDropEvent(({ payload }) => {
    if (payload.type === "leave") {
      handler({ kind: "leave" });
      return;
    }
    const { x, y } = payload.position.toLogical(window.devicePixelRatio);
    if (payload.type === "drop") handler({ kind: "drop", x, y, paths: payload.paths });
    else if (payload.type === "enter") handler({ kind: "hover", x, y, paths: payload.paths });
    else handler({ kind: "hover", x, y });
  });
}
