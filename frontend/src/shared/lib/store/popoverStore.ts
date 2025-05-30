import { create } from "zustand";

export const usePopoverStore = create<{
  openId: string | null;
  setOpenId: (id: string | null) => void;
}>((set) => ({
  openId: null,
  setOpenId: (id) => set({ openId: id }),
}));
