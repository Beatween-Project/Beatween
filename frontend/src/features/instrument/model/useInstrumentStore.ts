// src/features/instrument/model/useInstrumentStore.ts
import { create } from "zustand";

type InstrumentState = {
  selected: string;
  setInstrument: (instrument: string) => void;

  selectedSheetUrl: string | null;
  setSelectedSheetUrl: (url: string) => void;
};

export const useInstrumentStore = create<InstrumentState>((set) => ({
  selected: "Piano",
  setInstrument: (instrument) => set({ selected: instrument }),

  selectedSheetUrl: null,
  setSelectedSheetUrl: (url) => set({ selectedSheetUrl: url }),
}));
