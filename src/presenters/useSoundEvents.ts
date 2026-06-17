import { useEffect } from "react";

import { onSoundChanged } from "@/model/ipc/commands";
import { useTransportStore } from "@/model/store/transportStore";

/**
 * Subscribes to the engine's `sound-changed` events and reflects which pads
 * have a sample loaded. The engine is the source of truth; the view greys out
 * empty pads from this state.
 */
export function useSoundEvents(): void {
  const setLoaded = useTransportStore((s) => s.setLoaded);

  useEffect(() => {
    const unlisten = onSoundChanged(({ pad, loaded }) => setLoaded(pad, loaded));
    return () => {
      void unlisten.then((off) => off());
    };
  }, [setLoaded]);
}
