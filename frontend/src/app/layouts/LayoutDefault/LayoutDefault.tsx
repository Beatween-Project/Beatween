import { bgColorClassMap } from "@/shared/lib/bgColorClassMap";
import { HeaderDefault } from "@/widgets/Header";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface LayoutDefaultProps {
  children: ReactNode;
  bgColor?: string;
  noScroll?: boolean;
}

export const LayoutDefault = ({
  children,
  bgColor,
  noScroll,
}: LayoutDefaultProps) => {
  const navigate = useNavigate();
  const bgClass = bgColorClassMap[bgColor ? bgColor : "blue"];

  return (
    <div
      className={`relative h-full w-full ${
        noScroll ? "" : "overflow-y-auto overflow-x-auto"
      } ${bgClass}`}
    >
      <HeaderDefault
        onLogoClick={() => {
          navigate("/");
        }}
        className="relative"
      />
      <main className="w-full h-[calc(100%-3.525rem)]">{children}</main>
    </div>
  );
};
