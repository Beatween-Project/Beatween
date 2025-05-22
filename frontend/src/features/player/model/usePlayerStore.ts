// src/features/player/model/usePlayerStore.ts
import { create } from "zustand";
import { useScoreStore } from "@/features/score/model/useScoreStore";

interface PlayerState {
  isPlaying: boolean;
  bpm: number;
  originalBpm: number;
  currentMeasure: number;

  togglePlay: () => void;
  stop: () => void;
  setBpm: (bpm: number) => void;
  resetBpm: () => void;
  setCurrentMeasure: (n: number) => void;
}

export const usePlayerStore = create<PlayerState>(() => ({
  get isPlaying() {
    return useScoreStore.getState().isPlaying;
  },
  get bpm() {
    return useScoreStore.getState().bpm;
  },
  originalBpm: useScoreStore.getState().bpm,
  get currentMeasure() {
    return useScoreStore.getState().currentMeasure;
  },

  togglePlay: () => {
    const score = useScoreStore.getState();
    const next = !score.isPlaying;
    score.setIsPlaying(next);
    // ⛔ currentMeasure를 여기서 초기화하지 않음!
  },

  stop: () => {
    const score = useScoreStore.getState();
    score.setIsPlaying(false);
    score.setCurrentMeasure(0); // ✅ 정지 시에만 초기화
  },

  setBpm: (bpm: number) => {
    useScoreStore.getState().setBpm(bpm);
  },

  resetBpm: () => {
    useScoreStore.getState().setBpm(usePlayerStore.getState().originalBpm);
  },

  setCurrentMeasure: (n: number) => {
    useScoreStore.getState().setCurrentMeasure(n);
  },
}));
