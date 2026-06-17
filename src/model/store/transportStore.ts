import { create } from "zustand";

import { PAD_COUNT, type PadId } from "@/model/domain/pad";

interface TransportState {
  /** Per-pad lit state, indexed by pad id. */
  lit: boolean[];
  setLit: (pad: PadId, on: boolean) => void;
}

/** Observable domain state. Swappable: presenters depend on this hook, not on
 *  zustand specifically. */
export const useTransportStore = create<TransportState>((set) => ({
  lit: Array<boolean>(PAD_COUNT).fill(false),
  setLit: (pad, on) =>
    set((state) => {
      const lit = state.lit.slice();
      lit[pad] = on;
      return { lit };
    }),
}));
