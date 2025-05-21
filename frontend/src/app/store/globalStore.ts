import { create } from "zustand";

type GlobalState = {
  isLoggedIn: boolean;
  accessToken: string | null;
  login: (status: boolean) => void;
  logout: () => void;
  introShown: boolean;
  setIntroShown: (shown: boolean) => void;
  isPlaying: boolean;
  setIsPlaying: (status: boolean) => void;
  clientId: number;
  setClientId: (id: number) => void;
  isManager: boolean;
  setIsManager: (isManager: boolean) => void;
  isDrawing: boolean;
  setIsDrawing: (value: boolean) => void;
};

export const useGlobalStore = create<GlobalState>((set) => ({
  isLoggedIn: true,
  accessToken: null,
  login: (status) =>
    set(() => ({
      isLoggedIn: true,
      accessToken: `${status}`,
    })),
  logout: () =>
    set(() => ({
      isLoggedIn: false,
      accessToken: null,
    })),
  isPlaying: false,
  setIsPlaying: (status) => set({ isPlaying: status }),
  introShown: false,
  setIntroShown: (shown) => set({ introShown: shown }),
  clientId: Math.floor(Math.random() * 10000),
  setClientId: (id) => set({ clientId: id }),
  isManager: false,
  setIsManager: (isManager) => set({ isManager }),
  isDrawing: false,
  setIsDrawing: (value) => set({ isDrawing: value }),
}));
