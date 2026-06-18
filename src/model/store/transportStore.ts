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
  /** Per-pad loaded state (authoritative, from the engine's `sound-changed`). */
  loaded: boolean[];
  /** Per-pad play mode. */
  modes: PadMode[];
  /** Per-pad source file path for individually-assigned sounds (null = none or
   *  pack-loaded). Persisted so the board can be restored on startup. */
  paths: (string | null)[];
  /** The global mode selector's current value (last bulk-applied mode). */
  globalMode: PadMode;
  /** Which half of the grid the keyboard currently addresses. */
  bank: Bank;
  setLit: (pad: PadId, on: boolean) => void;
  setLooping: (pad: PadId, on: boolean) => void;
  setLoaded: (pad: PadId, on: boolean) => void;
  setPadMode: (pad: PadId, mode: PadMode) => void;
  /** Record (or clear) a pad's individually-assigned sound path. */
  setPath: (pad: PadId, path: string | null) => void;
  /** Forget every per-pad sound path (e.g. clearing the board or loading a pack). */
  resetPaths: () => void;
  /** Apply one mode to every pad (the global selector). */
  setGlobalMode: (mode: PadMode) => void;
  /** Bulk-set per-pad modes (e.g. after loading a pack). */
  setModes: (entries: { pad: PadId; mode: PadMode }[]) => void;
  /** Reset every pad to the default mode (e.g. before loading a pack). */
  resetModes: () => void;
  setBank: (bank: Bank) => void;
  toggleBank: () => void;
}

/** Observable domain state. Swappable: presenters depend on this hook, not on
 *  zustand specifically. */
export const useTransportStore = create<TransportState>((set) => ({
  lit: Array<boolean>(PAD_COUNT).fill(false),
  looping: Array<boolean>(PAD_COUNT).fill(false),
  loaded: Array<boolean>(PAD_COUNT).fill(false),
  modes: Array<PadMode>(PAD_COUNT).fill(DEFAULT_MODE),
  paths: Array<string | null>(PAD_COUNT).fill(null),
  globalMode: DEFAULT_MODE,
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
  setLoaded: (pad, on) =>
    set((state) => {
      const loaded = state.loaded.slice();
      loaded[pad] = on;
      return { loaded };
    }),
  setPadMode: (pad, mode) =>
    set((state) => {
      const modes = state.modes.slice();
      modes[pad] = mode;
      return { modes };
    }),
  setPath: (pad, path) =>
    set((state) => {
      const paths = state.paths.slice();
      paths[pad] = path;
      return { paths };
    }),
  resetPaths: () => set({ paths: Array<string | null>(PAD_COUNT).fill(null) }),
  setGlobalMode: (mode) =>
    set({ globalMode: mode, modes: Array<PadMode>(PAD_COUNT).fill(mode) }),
  setModes: (entries) =>
    set((state) => {
      const modes = state.modes.slice();
      for (const { pad, mode } of entries) modes[pad] = mode;
      return { modes };
    }),
  resetModes: () => set({ modes: Array<PadMode>(PAD_COUNT).fill(DEFAULT_MODE) }),
  setBank: (bank) => set({ bank }),
  toggleBank: () => set((state) => ({ bank: state.bank === "top" ? "bottom" : "top" })),
}));
