import { create } from "zustand";
import { Sheet } from "@/entities/song/types/song.types";

interface ScoreStore {
  xmlData: string;
  setXmlData: (data: string) => void;

  currentMeasure: number;
  setCurrentMeasure: (measure: number) => void;

  measureCount: number;
  setMeasureCount: (count: number) => void;

  bpm: number;
  setBpm: (bpm: number) => void;

  baseBpm: number;
  setBaseBpm: (bpm: number) => void;

  thumbnails: string[];
  setThumbnails: (thumbnails: string[]) => void;

  selectedNote: string | null;
  setSelectedNote: (note: string | null) => void;

  isPreviewVisible: boolean;
  togglePreview: () => void;

  isFullscreen: boolean;
  toggleFullscreen: () => void;

  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;

  systems: { el: Element; measureIds: number[] }[];
  setSystems: (systems: { el: Element; measureIds: number[] }[]) => void;

  selectedSheets: Sheet[];
  setSelectedSheets: (sheets: Sheet[]) => void;

  selectedPartSheetUrl: string | null;
  setSelectedPartSheetUrl: (url: string) => void;

  parts: string[];
  setParts: (parts: string[]) => void;

  reset: () => void;
}

const initialState = {
  xmlData: "",
  currentMeasure: 0,
  measureCount: 0,
  bpm: 120,
  baseBpm: 120,
  thumbnails: [],
  selectedNote: null,
  isPreviewVisible: false,
  isFullscreen: false,
  isPlaying: false,
  systems: [],
  selectedSheets: [],
  selectedPartSheetUrl: null,
  parts: [],
};

export const useScoreStore = create<ScoreStore>((set) => ({
  ...initialState,
  setXmlData: (data) => set({ xmlData: data }),
  setCurrentMeasure: (measure) => set({ currentMeasure: measure }),
  setMeasureCount: (count) => set({ measureCount: count }),
  setBpm: (bpm) => set({ bpm }),
  setBaseBpm: (bpm) => set({ baseBpm: bpm }),
  setThumbnails: (thumbnails) => set({ thumbnails }),
  setSelectedNote: (note) => set({ selectedNote: note }),
  togglePreview: () =>
    set((state) => ({ isPreviewVisible: !state.isPreviewVisible })),
  toggleFullscreen: () =>
    set((state) => ({ isFullscreen: !state.isFullscreen })),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setSystems: (systems) => set({ systems }),
  setSelectedSheets: (sheets) => set({ selectedSheets: sheets }),
  setSelectedPartSheetUrl: (url) => set({ selectedPartSheetUrl: url }),
  setParts: (parts) => set({ parts }),
  reset: () => set(initialState),
}));
