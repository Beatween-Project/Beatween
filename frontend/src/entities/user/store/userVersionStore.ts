import { create } from "zustand";

interface UserImageVersionStore {
  version: number;
  updateVersion: () => void;
}

export const useUserImageVersionStore = create<UserImageVersionStore>(
  (set) => ({
    version: 0,
    updateVersion: () => set({ version: Date.now() }),
  })
);
