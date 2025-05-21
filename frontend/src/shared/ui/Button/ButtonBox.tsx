import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonBoxProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const ButtonBox = ({
  children,
  className,
  ...props
}: ButtonBoxProps) => {
  return (
    <button
      className={`hover:bg-neutral200 transition-all duration-3000 bg-neutral100 border-2 border-neutral200 rounded-xl py-3 px-5 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
