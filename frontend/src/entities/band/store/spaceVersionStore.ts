import { create } from "zustand";

interface SpaceVersionStore {
  versionMap: Record<number, number>;
  updateVersion: (spaceId: number) => void;
  getVersion: (spaceId: number) => number;
}

export const useSpaceVersionStore = create<SpaceVersionStore>((set, get) => ({
  versionMap: {},
  updateVersion: (spaceId) =>
    set((state) => ({
      versionMap: {
        ...state.versionMap,
        [spaceId]: Date.now(),
      },
    })),
  getVersion: (spaceId) => get().versionMap[spaceId] ?? 0,
}));
