import { ButtonHTMLAttributes, ReactNode } from "react";

interface SpaceButtonPanelProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}

export const SpaceButtonPanel = ({
  children,
  className,
  ...props
}: SpaceButtonPanelProps) => {
  return (
    <button
      className={`transition-all duration-3000 hover:shadow-brandcolor200 hover:shadow-[0_0_36px_0] shrink-0 flex flex-wrap flex-grow basis-0 items-center border border-brandcolor200 rounded-lg p-6 bg-neutral1000 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
