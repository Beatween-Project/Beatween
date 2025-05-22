// useScoreStore.ts
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

  // 새로 추가: parts 상태 관리
  parts: string[];
  setParts: (parts: string[]) => void;
}

export const useScoreStore = create<ScoreStore>((set) => ({
  xmlData: "",
  setXmlData: (data) => set({ xmlData: data }),

  currentMeasure: 0,
  setCurrentMeasure: (measure) => set({ currentMeasure: measure }),

  measureCount: 0,
  setMeasureCount: (count) => set({ measureCount: count }),

  bpm: 120,
  setBpm: (bpm) => set({ bpm }),

  baseBpm: 120,
  setBaseBpm: (bpm) => set({ baseBpm: bpm }),

  thumbnails: [],
  setThumbnails: (thumbnails) => set({ thumbnails }),

  selectedNote: null,
  setSelectedNote: (note) => set({ selectedNote: note }),

  isPreviewVisible: false,
  togglePreview: () =>
    set((state) => ({ isPreviewVisible: !state.isPreviewVisible })),

  isFullscreen: false,
  toggleFullscreen: () =>
    set((state) => ({ isFullscreen: !state.isFullscreen })),

  isPlaying: false,
  setIsPlaying: (isPlaying) => set({ isPlaying }),

  systems: [],
  setSystems: (systems) => set({ systems }),

  selectedSheets: [],
  setSelectedSheets: (sheets) => {
    set({ selectedSheets: sheets });
  },

  selectedPartSheetUrl: null,
  setSelectedPartSheetUrl: (url) => set({ selectedPartSheetUrl: url }),

  // 새로 추가: parts 상태 초기화 및 설정 함수
  parts: [],
  setParts: (parts) => {
    set({ parts });
  },
}));
