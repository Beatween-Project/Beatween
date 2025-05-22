import { create } from "zustand";

interface HeaderFooterState {
  showHeaderFooter: boolean;
  setShowHeaderFooter: (show: boolean | ((prev: boolean) => boolean)) => void;
}

export const useHeaderFooterStore = create<HeaderFooterState>((set) => ({
  showHeaderFooter: false,
  setShowHeaderFooter: (show) =>
    set((state) => ({
      showHeaderFooter: typeof show === "function" ? show(state.showHeaderFooter) : show,
    })),
}));