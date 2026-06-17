import { useEffect } from "react";

import { onLoopChanged } from "@/model/ipc/commands";
import { useTransportStore } from "@/model/store/transportStore";

/**
 * Subscribes to the engine's `loop-changed` events and reflects them in state.
 * The engine is the source of truth for which pads are looping; the view just
 * mirrors it.
 */
export function useLoopEvents(): void {
  const setLooping = useTransportStore((s) => s.setLooping);

  useEffect(() => {
    const unlisten = onLoopChanged(({ pad, looping }) => setLooping(pad, looping));
    return () => {
      void unlisten.then((off) => off());
    };
  }, [setLooping]);
}
