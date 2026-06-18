import { useEffect } from "react";

import { onSoundLoadFailed } from "@/model/ipc/commands";
import { showError } from "@/model/ipc/dialog";
import { useT } from "@/presenters/useT";

/** Surfaces audio-thread sample-decode failures to the user. */
export function useSoundErrorEvents(): void {
  const t = useT();
  useEffect(() => {
    const unlisten = onSoundLoadFailed(({ pad, error }) =>
      void showError(t((m) => m.dialog.soundLoadFailed(pad + 1, error))),
    );
    return () => {
      void unlisten.then((off) => off());
    };
  }, [t]);
}
