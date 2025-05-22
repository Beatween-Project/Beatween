import { create } from "zustand";

interface PersonalSpaceState {
  personalSpaceId: number | null;
  setPersonalSpaceId: (id: number) => void;
}

export const usePersonalSpaceStore = create<PersonalSpaceState>((set) => ({
  personalSpaceId: null,
  setPersonalSpaceId: (id) => set({ personalSpaceId: id }),
}));
