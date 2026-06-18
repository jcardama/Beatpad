import { useEffect } from "react";

import { onSoundLoadFailed } from "@/model/ipc/commands";
import { showError } from "@/model/ipc/dialog";

/** Surfaces audio-thread sample-decode failures to the user. */
export function useSoundErrorEvents(): void {
  useEffect(() => {
    const unlisten = onSoundLoadFailed(({ pad, error }) =>
      void showError(`Pad ${pad + 1}: couldn't play that sound.\n${error}`),
    );
    return () => {
      void unlisten.then((off) => off());
    };
  }, []);
}
