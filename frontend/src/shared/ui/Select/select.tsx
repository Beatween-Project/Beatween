import { SelectHTMLAttributes } from "react";
import classNames from "classnames";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={classNames(
        "px-3 py-2 border rounded bg-white text-sm shadow-sm outline-none focus:ring-2 focus:ring-brandcolor100",
        className
      )}
    >
      {children}
    </select>
  );
}
