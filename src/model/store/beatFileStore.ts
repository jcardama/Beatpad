import { create } from "zustand";

interface BeatFileState {
  /** Path of the `.beat` the board is bound to (last opened or saved), or null
   *  for an unsaved board. "Save" writes here; otherwise it prompts. */
  path: string | null;
  setPath: (path: string | null) => void;
}

export const useBeatFileStore = create<BeatFileState>((set) => ({
  path: null,
  setPath: (path) => set({ path }),
}));
