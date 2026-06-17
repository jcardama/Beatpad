import { create } from "zustand";

import {
  DEFAULT_BANK,
  DEFAULT_MODE,
  PAD_COUNT,
  type Bank,
  type PadId,
  type PadMode,
} from "@/model/domain/pad";

interface TransportState {
  /** Per-pad lit state (optimistic, on press). */
  lit: boolean[];
  /** Per-pad looping state (authoritative, from the engine's `loop-changed`). */
  looping: boolean[];
  /** Global play mode applied to every pad. */
  mode: PadMode;
  /** Which half of the grid the keyboard currently addresses. */
  bank: Bank;
  setLit: (pad: PadId, on: boolean) => void;
  setLooping: (pad: PadId, on: boolean) => void;
  setMode: (mode: PadMode) => void;
  setBank: (bank: Bank) => void;
  toggleBank: () => void;
}

/** Observable domain state. Swappable: presenters depend on this hook, not on
 *  zustand specifically. */
export const useTransportStore = create<TransportState>((set) => ({
  lit: Array<boolean>(PAD_COUNT).fill(false),
  looping: Array<boolean>(PAD_COUNT).fill(false),
  mode: DEFAULT_MODE,
  bank: DEFAULT_BANK,
  setLit: (pad, on) =>
    set((state) => {
      const lit = state.lit.slice();
      lit[pad] = on;
      return { lit };
    }),
  setLooping: (pad, on) =>
    set((state) => {
      const looping = state.looping.slice();
      looping[pad] = on;
      return { looping };
    }),
  setMode: (mode) => set({ mode }),
  setBank: (bank) => set({ bank }),
  toggleBank: () => set((state) => ({ bank: state.bank === "top" ? "bottom" : "top" })),
}));
