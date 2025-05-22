// shared/ui/Modal/ModalPortal.tsx
import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalPortalProps {
  children: ReactNode;
}

export const ModalPortal = ({ children }: ModalPortalProps) => {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let modalRoot = document.getElementById("modal-root");

    if (!modalRoot) {
      modalRoot = document.createElement("div");
      modalRoot.id = "modal-root";
      document.body.appendChild(modalRoot);
    }

    setPortalElement(modalRoot);
  }, []);

  if (!portalElement) return null;

  return createPortal(children, portalElement);
};

export default ModalPortal;
