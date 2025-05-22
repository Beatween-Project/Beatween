import { create } from "zustand";

interface SongVersionStore {
  versionMap: Record<number, number>;
  updateVersion: (songId: number) => void;
}

export const useSongVersionStore = create<SongVersionStore>((set) => ({
  versionMap: {},
  updateVersion: (songId) =>
    set((state) => ({
      versionMap: {
        ...state.versionMap,
        [songId]: Date.now(),
      },
    })),
}));
