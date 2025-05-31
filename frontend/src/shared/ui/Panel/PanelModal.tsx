import { Tone } from "@/shared/types/tone";
import { MouseEventHandler, ReactNode } from "react";

type PanelModalProps = {
  onClick?: MouseEventHandler<HTMLDivElement>;
  tone?: Tone;
  className?: string;
  children: ReactNode;
};

const toneBgClasses: Record<Tone, string> = {
  white: "bg-neutral100",
  light: "bg-neutral100/30",
  neutral: "bg-neutral400",
  dark: "bg-neutral1000/30",
  black: "bg-neutral1000",
  yellow: "bg-yellow-400", // ✅ 이 줄 추가

};

export function PanelModal({
  onClick,
  tone = "light",
  className = "",
  children,
}: PanelModalProps) {
  const bgClass = toneBgClasses[tone];

  return (
    <div
      onClick={onClick}
      className={`${bgClass} rounded-xl overflow-hidden b-blur ${className}`}
    >
      {children}
    </div>
  );
}
