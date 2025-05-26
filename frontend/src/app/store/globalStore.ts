import { create } from "zustand";

type GlobalState = {
  accessToken: string | null;
  isLoggedIn: boolean;

  login: (token: string) => void;
  logout: () => void;

  introShown: boolean;
  setIntroShown: (shown: boolean) => void;

  isPlaying: boolean;
  setIsPlaying: (status: boolean) => void;

  clientId: number;
  setClientId: (id: number) => void;

  userId: number | null; // ✅ 추가
  setUserId: (id: number) => void; // ✅ 추가

  isManager: boolean;
  setIsManager: (isManager: boolean) => void;

  isDrawing: boolean;
  setIsDrawing: (value: boolean) => void;
  isEraser: boolean;
  setIsEraser: (value: boolean) => void;
  hasSelectedSong: boolean;
  setHasSelectedSong: (value: boolean) => void;
};


export const useGlobalStore = create<GlobalState>((set, get) => ({
  accessToken: localStorage.getItem("accessToken"),
  get isLoggedIn() {
    return !!get().accessToken;
  },

  login: (token) => {
    localStorage.setItem("accessToken", token);
    set({ accessToken: token });
    window.location.href = "/";
  },
  logout: () => {
    localStorage.removeItem("accessToken");
    set({ accessToken: null, userId: null }); // userId도 초기화
    window.location.href = "/";
  },

  isPlaying: false,
  setIsPlaying: (status) => set({ isPlaying: status }),

  introShown: false,
  setIntroShown: (shown) => set({ introShown: shown }),

  clientId: Math.floor(Math.random() * 10000),
  setClientId: (id) => set({ clientId: id }),

  userId: null, // ✅ 기본값
  setUserId: (id) => set({ userId: id }),

  isManager: false,
  setIsManager: (flag) => set({ isManager: flag }),

  isDrawing: false,
  setIsDrawing: (value) => set({ isDrawing: value }),
  isEraser: false,
  setIsEraser: (value) => set({ isEraser: value }),
  hasSelectedSong: false,
  setHasSelectedSong: (value) => set({ hasSelectedSong: value }),
}));