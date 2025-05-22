import { Tone } from "@/shared/types/tone";
import { ReactNode } from "react";

type PanelModalProps = {
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
};

export function PanelModal({
  tone = "light",
  className = "",
  children,
}: PanelModalProps) {
  const bgClass = toneBgClasses[tone];

  return (
    <div className={`${bgClass} rounded-xl b-blur ${className}`}>
      {children}
    </div>
  );
}
