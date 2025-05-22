import { ReactNode } from "react";

interface ModalBackgroundProps {
  children: ReactNode;
}

export const ModalBackground = ({ children }: ModalBackgroundProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral1000/70">
      {children}
    </div>
  );
};
