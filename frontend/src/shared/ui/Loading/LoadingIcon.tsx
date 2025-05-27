import { Icon } from "../Icon";

interface LoadingIconProps {
  color?: "green" | "blue";
  className?: string;
}

const colorMap: Record<NonNullable<LoadingIconProps["color"]>, string> = {
  green: "text-brandcolor200",
  blue: "text-brandcolor100",
};

export const LoadingIcon = ({
  color = "green",
  className,
}: LoadingIconProps) => {
  return (
    <div
      className={`flex animate-spin w-fit h-fit ${colorMap[color]} ${className}`}
    >
      <Icon icon="progress_activity" />
    </div>
  );
};
