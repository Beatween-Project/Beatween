import { create } from "zustand";
import { ModalType } from "@/shared/types/modal";

interface ModalState {
  type: ModalType | null;
  props: any;
  openModal: (type: ModalType, props?: any) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  type: null,
  props: {},
  openModal: (type, props = {}) => set({ type, props }),
  closeModal: () => set({ type: null, props: {} }),
}));
