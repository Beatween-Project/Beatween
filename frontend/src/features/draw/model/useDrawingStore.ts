// features/drawing/model/useDrawingStore.ts

import { create } from "zustand";

export type LineData = {
  points: number[];
  color: string;
  mode: "source-over" | "destination-out";
};

interface DrawingState {
  lines: LineData[];
  isEraser: boolean;
  addLine: (line: LineData) => void;
  updateLastLine: (line: LineData) => void;
  toggleEraser: () => void;
  reset: () => void;
}

export const useDrawingStore = create<DrawingState>((set) => ({
  lines: [],
  isEraser: false,
  addLine: (line) => set((state) => ({ lines: [...state.lines, line] })),
  updateLastLine: (line) =>
    set((state) => ({
      lines: [...state.lines.slice(0, -1), line],
    })),
  toggleEraser: () => set((state) => ({ isEraser: !state.isEraser })),
  reset: () => set({ lines: [], isEraser: false }),
}));
