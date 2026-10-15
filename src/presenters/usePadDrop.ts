import { useEffect, useState, type RefObject } from "react";

import { fileName, isAudioFile } from "@/model/domain/audio";
import type { PadId } from "@/model/domain/pad";
import { onFileDrop } from "@/model/ipc/fileDrop";
import { useToastStore } from "@/model/store/toastStore";
import { useT } from "@/presenters/useT";

/** The pad a dragged file is over, and the file's name for the drop chip. */
export interface DropTarget {
  pad: PadId;
  name: string;
}

/** The pad whose rendered rect contains (x, y), if any. Pads carry `data-pad`. */
export function padAt(board: HTMLElement, x: number, y: number): PadId | null {
  for (const el of board.querySelectorAll<HTMLElement>("[data-pad]")) {
    const r = el.getBoundingClientRect();
    if (x >= r.left && x < r.right && y >= r.top && y < r.bottom) {
      return Number(el.dataset.pad);
    }
  }
  return null;
}

/**
 * Lets the user drop an audio file from the OS onto a pad. Tracks the pad under
 * the drag for highlighting and loads the file through `loadSound`, the same
 * path as "Load sound…". Non-audio files are refused with the load error toast.
 */
export function usePadDrop(
  boardRef: RefObject<HTMLElement | null>,
  loadSound: (pad: PadId, path: string) => Promise<void>,
): DropTarget | null {
  const [target, setTarget] = useState<DropTarget | null>(null);
  const toast = useToastStore((s) => s.show);
  const t = useT();

  useEffect(() => {
    let name = "";
    const sub = onFileDrop((e) => {
      const board = boardRef.current;
      if (e.kind === "leave" || !board) {
        setTarget(null);
        return;
      }
      if (e.paths?.length) name = fileName(e.paths[0]);
      const pad = padAt(board, e.x, e.y);
      if (e.kind === "hover") {
        setTarget((prev) =>
          pad === null
            ? null
            : prev?.pad === pad && prev.name === name
              ? prev
              : { pad, name },
        );
        return;
      }
      setTarget(null);
      const path = e.paths[0];
      if (pad === null || !path) return;
      if (!isAudioFile(path)) {
        toast({ variant: "error", message: t((m) => m.dialog.loadSoundError(name)) });
        return;
      }
      void loadSound(pad, path);
    });
    return () => void sub.then((off) => off());
  }, [boardRef, loadSound, toast, t]);

  return target;
}
