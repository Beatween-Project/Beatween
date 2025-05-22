import { ReactNode } from "react";
import { Icon } from "../Icon";

interface ItemFieldProps {
  variant?: "row" | "col";
  icon?: string;
  iconColor?: "green" | "red";
  fill?: boolean;
  title?: string;
  required?: boolean;
  children: ReactNode;
}

export const ItemField = ({
  variant = "col",
  icon,
  iconColor = "green",
  fill,
  title,
  required,
  children,
}: ItemFieldProps) => {
  return (
    <div
      className={`flex flex-${variant} ${
        variant === "row" ? "gap-4" : "gap-1"
      }`}
    >
      <div className={`flex gap-1 font-medium items-center`}>
        {icon && (
          <p
            className={`flex ${
              iconColor === "red" ? "text-red" : "text-brandcolor200"
            }`}
          >
            <Icon icon={icon} fill={fill} size={18} />
          </p>
        )}

        {title && (
          <p className="flex flex-wrap gap-1 items-center">
            <span>{title}</span>
            {required && <span className="text-red">*</span>}
          </p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
};
