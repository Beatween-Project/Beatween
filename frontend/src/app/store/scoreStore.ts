import { create } from "zustand";
import { Sheet } from "@/entities/song/types/song.types";

interface ScoreState {
  isPlaying: boolean;
  currentMeasure: number;
  totalMeasures: number;
  tempo: number;
  selectedInstrument: string;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentMeasure: (measure: number) => void;
  setTotalMeasures: (measures: number) => void;
  setTempo: (tempo: number) => void;
  setSelectedInstrument: (instrument: string) => void;
  selectedSheets: Sheet[]; // ex: [{ part: "vocal", sheetUrl: "..."}]
  selectedPartSheetUrl: string | null;
  setSelectedSheets: (sheets: Sheet[]) => void;
  setSelectedPartSheetUrl: (url: string) => void;
}

export const useScoreStore = create<ScoreState>((set) => ({
  isPlaying: false,
  currentMeasure: 1,
  totalMeasures: 110,
  tempo: 145,
  selectedInstrument: "Guitar 1",
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentMeasure: (currentMeasure) => set({ currentMeasure }),
  setTotalMeasures: (totalMeasures) => set({ totalMeasures }),
  setTempo: (tempo) => set({ tempo }),
  setSelectedInstrument: (selectedInstrument) => set({ selectedInstrument }),
  selectedSheets: [],
  selectedPartSheetUrl: null,
  setSelectedSheets: (sheets) => set({ selectedSheets: sheets }),
  setSelectedPartSheetUrl: (url) => set({ selectedPartSheetUrl: url }),
}));
