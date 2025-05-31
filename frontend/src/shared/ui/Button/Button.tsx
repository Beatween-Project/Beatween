import classNames from "classnames";
import { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "../Icon";

type Size = "small" | "medium" | "large";
type Color = "green" | "blue" | "caution" | "light" | "dark";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: string;
  fill?: boolean;
  size?: Size;
  color?: Color;
  children: ReactNode;
}

const sizeClass = {
  small: ` px-4 py-2 text-base gap-1`,
  medium: `px-5 py-2.5 text-lg gap-2`,
  large: `px-7 py-3.5 text-2xl gap-3`,
};

const iconSize = {
  // small과 medium은 글자보다 살짝 크게 조정했습니다
  small: 18,
  medium: 20,
  large: 24,
};

const colorClass = {
  green: `bg-brandcolor200 text-neutral1000`,
  blue: `bg-brandcolor100 text-neutral100`,
  caution: `bg-red text-neural100`,
  light: `bg-neutral200 text-neutral1000`,
  dark: `bg-neutral800 text-neutral200`,
  yellow: "text-yellow-400", // ✅ 반드시 포함해야 TypeScript 오류가 안 납니다.

};

export const Button = ({
  icon,
  fill,
  size = "small",
  color = "light",
  children,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={classNames(
        "inline-flex items-center justify-center max-w-full rounded-xl",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        sizeClass[size],
        colorClass[color],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {icon && <Icon icon={icon} size={iconSize[size]} fill={fill} />}
      <div className="flex-grow">{children}</div>
    </button>
  );
};
