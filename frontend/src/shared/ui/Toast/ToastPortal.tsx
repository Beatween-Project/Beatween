import { useToastStore } from "@/shared/lib/store/toastStore";
import { ToastItem } from "./Toast";
import { AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

export const ToastPortal = () => {
  const toasts = useToastStore((state) => state.toasts);

  return createPortal(
    <div className="pointer-events-none fixed bottom-4 left-4 z-[100] space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
};
