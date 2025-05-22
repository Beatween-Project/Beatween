import { create } from "zustand";

interface SheetStore {
  isCreating: boolean;
  setCreating: (creating: boolean) => void;
}

export const useSheetStore = create<SheetStore>((set) => ({
  isCreating: false,
  setCreating: (creating) => set({ isCreating: creating }),
}));
