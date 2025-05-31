import { create } from "zustand";
import { SongCategory } from "@/entities/song/api/songApi";

interface SongListStore {
  categories: SongCategory[];
  setCategories: (categories: SongCategory[]) => void;
  reset: () => void;
}

export const useSongListStore = create<SongListStore>((set) => ({
  categories: [],
  setCategories: (categories) => set({ categories }),
  reset: () => set({ categories: [] }),
}));
