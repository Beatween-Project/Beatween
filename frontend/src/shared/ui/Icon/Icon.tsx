import { IconProps } from "./icon-props";

export const Icon = ({ icon, fill, size = 24, tone }: IconProps) => {
  const colorClass = {
    white: `text-neutral100`,
    light: `text-neutral100/70`,
    neutral: `text-neutral400`,
    dark: `text-neutral1000/70`,
    black: `text-neutral1000`,
    yellow: "text-yellow-400", // ✅ 추가

  };

  return (
    <i
      className={`material-symbols-rounded ${tone ? colorClass[tone] : null}`}
      style={{
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'opsz' ${size}`,
        fontSize: size,
      }}
    >
      {icon}
    </i>
  );
};
