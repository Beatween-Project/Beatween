import { create } from "zustand";

interface UserState {
  name: string;
  avatarUrl: string;
  setName: (name: string) => void;
  setAvatarUrl: (url: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  name: "사용자",
  avatarUrl: "https://api.dicebear.com/6.x/initials/svg?seed=사용자",
  setName: (name) =>
    set({
      name,
      avatarUrl: `https://api.dicebear.com/6.x/initials/svg?seed=${name}`,
    }),
  setAvatarUrl: (url) => set({ avatarUrl: url }),
}));
