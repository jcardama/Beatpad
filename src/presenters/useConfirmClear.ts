import { useCallback, useState } from "react";

import type { PadId } from "@/model/domain/pad";

/** Holds a pad's "Clear sound" request until the user confirms or cancels it. */
export function useConfirmClear(clearSound: (pad: PadId) => void) {
  const [pad, setPad] = useState<PadId | null>(null);

  const confirm = useCallback(() => {
    if (pad !== null) clearSound(pad);
    setPad(null);
  }, [pad, clearSound]);

  const cancel = useCallback(() => setPad(null), []);

  return { pad, request: setPad, confirm, cancel };
}
