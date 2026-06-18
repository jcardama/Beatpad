import { useEffect } from "react";

import { onSoundLoadFailed } from "@/model/ipc/commands";
import { useToastStore } from "@/model/store/toastStore";
import { useT } from "@/presenters/useT";

/** Surfaces audio-thread sample-decode failures to the user. */
export function useSoundErrorEvents(): void {
  const t = useT();
  const toast = useToastStore((s) => s.show);
  useEffect(() => {
    const unlisten = onSoundLoadFailed(({ pad, error }) =>
      toast({
        variant: "error",
        message: t((m) => m.dialog.soundLoadFailed(pad + 1, error)),
      }),
    );
    return () => {
      void unlisten.then((off) => off());
    };
  }, [t, toast]);
}
