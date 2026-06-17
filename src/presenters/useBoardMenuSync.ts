import { useEffect } from "react";

import { setBoardEnabled } from "@/model/ipc/commands";
import { useTransportStore } from "@/model/store/transportStore";

/** Keeps the board-dependent menu items (File → Close, Edit → Clear) enabled
 *  only while the board has sounds loaded. */
export function useBoardMenuSync(): void {
  const anyLoaded = useTransportStore((s) => s.loaded.some(Boolean));

  useEffect(() => {
    void setBoardEnabled(anyLoaded);
  }, [anyLoaded]);
}
