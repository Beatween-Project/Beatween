import { create } from "zustand";

interface MetronomeState {
  isEnabled: boolean;
  toggle: () => void;
  volume: number;
  setVolume: (v: number) => void;
}

export const useMetronomeStore = create<MetronomeState>((set) => ({
  isEnabled: false,
  volume: 0.5,
  toggle: () => set((state) => ({ isEnabled: !state.isEnabled })),
  setVolume: (v) => set({ volume: v }),
}));
