import { useCallback } from "react";

import { PAD_LABELS, type PadId } from "@/model/domain/pad";
import { releasePad, triggerPad } from "@/model/ipc/commands";
import { useTransportStore } from "@/model/store/transportStore";

/** View-model for a single pad. */
export interface PadVm {
  id: PadId;
  label: string;
  lit: boolean;
}

/**
 * Presentation logic for the pad grid: shapes domain state into pad
 * view-models and exposes press/release handlers. No JSX — unit-testable
 * headless.
 */
export function usePadGrid() {
  const lit = useTransportStore((s) => s.lit);
  const setLit = useTransportStore((s) => s.setLit);

  const press = useCallback(
    (pad: PadId) => {
      setLit(pad, true); // optimistic: light immediately
      void triggerPad(pad);
    },
    [setLit],
  );

  const release = useCallback(
    (pad: PadId) => {
      setLit(pad, false);
      void releasePad(pad);
    },
    [setLit],
  );

  const pads: PadVm[] = PAD_LABELS.map((label, id) => ({
    id,
    label,
    lit: lit[id] ?? false,
  }));

  return { pads, press, release };
}
