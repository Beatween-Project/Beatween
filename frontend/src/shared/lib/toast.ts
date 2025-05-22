// src/shared/lib/toast.ts
import { useToastStore } from "@/shared/lib/store/toastStore";

interface ToastOptions {
  title?: string;
  message?: string;
  duration?: number;
}

export const toast = {
  success: ({ title, message, duration }: ToastOptions) =>
    useToastStore
      .getState()
      .addToast({ title, message, type: "success", duration }),
  warning: ({ title, message, duration }: ToastOptions) =>
    useToastStore
      .getState()
      .addToast({ title, message, type: "warning", duration }),
  error: ({ title, message, duration }: ToastOptions) =>
    useToastStore
      .getState()
      .addToast({ title, message, type: "error", duration }),
  info: ({ title, message, duration }: ToastOptions) =>
    useToastStore
      .getState()
      .addToast({ title, message, type: "info", duration }),
};
