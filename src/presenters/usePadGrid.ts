import { useCallback } from "react";

import {
  PAD_COUNT,
  padBank,
  padLabel,
  type Bank,
  type PadId,
  type PadMode,
} from "@/model/domain/pad";
import { releasePad, triggerPad } from "@/model/ipc/commands";
import { useTransportStore } from "@/model/store/transportStore";

/** View-model for a single pad. */
export interface PadVm {
  id: PadId;
  label: string;
  bank: Bank;
  lit: boolean;
  looping: boolean;
  loaded: boolean;
  mode: PadMode;
}

/**
 * Presentation logic for the pad grid: shapes domain state into pad
 * view-models and exposes press/release handlers. No JSX — unit-testable
 * headless.
 */
export function usePadGrid() {
  const lit = useTransportStore((s) => s.lit);
  const looping = useTransportStore((s) => s.looping);
  const loaded = useTransportStore((s) => s.loaded);
  const modes = useTransportStore((s) => s.modes);
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

  const pads: PadVm[] = Array.from({ length: PAD_COUNT }, (_, id) => ({
    id,
    label: padLabel(id),
    bank: padBank(id),
    lit: lit[id] ?? false,
    looping: looping[id] ?? false,
    loaded: loaded[id] ?? false,
    mode: modes[id] ?? "one_shot",
  }));

  return { pads, press, release };
}
