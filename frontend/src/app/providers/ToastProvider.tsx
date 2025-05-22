// src/shared/ui/toast/ToastProvider.tsx
import { createContext, useContext, ReactNode } from "react";
import { useToastStore } from "@/shared/lib/store/toastStore";
import { ToastPortal } from "@/shared/ui/Toast";

const ToastContext = createContext<any>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const { addToast } = useToastStore();

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastPortal />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
