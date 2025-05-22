import { bgColorClassMap } from "@/shared/lib/bgColorClassMap";
import { HeaderDefault } from "@/widgets/Header";
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useState } from "react";
import tvImage from "./assets/images/tvtransparent.svg";

interface LayoutDefaultProps {
  children: ReactNode;
  rightChildren: ReactNode;
  bgColor?: string;
  initialShrunk?: boolean;
}

export const LayoutShrink = ({
  children,
  rightChildren,
  bgColor,
  initialShrunk = false,
}: LayoutDefaultProps) => {
  const bgClass = bgColorClassMap[bgColor ? bgColor : "blue"];
  const [isShrunk, setIsShrunk] = useState(initialShrunk);
  const [transitionActive, setTransitionActive] = useState(false);

  const handleShrink = () => {
    setTransitionActive(true);
    setIsShrunk(true);
    // 의도적으로 navigate 대신 pushState를 적용해두었습니다
    // 자연스러운 애니메이션 적용을 위해 리렌더링하지 않고, 주소만 바꾸는 것이 목적입니다
    window.history.pushState({}, "", "/sign");
    setTimeout(() => setTransitionActive(false), 1000);
  };

  const handleExpand = () => {
    setTransitionActive(true);
    setIsShrunk(false);
    window.history.pushState({}, "", "/");
    setTimeout(() => setTransitionActive(false), 1000);
  };

  return (
    <div className={`w-full h-full ${bgClass}`}>
      <HeaderDefault
        onLogoClick={handleExpand}
        onShrink={handleShrink}
        isSignPage={isShrunk}
        className="fixed"
      />
      <div
        className={`fixed left-0 w-full h-full flex md:justify-end justify-center items-center transition-all duration-1000 ${
          isShrunk ? "md:scale-[50%] md:-translate-x-[calc(25%)]" : ""
        }`}
      >
        {isShrunk && (
          <img
            src={tvImage}
            alt="tv image"
            className="absolute w-[70vw] md:-translate-x-[5rem]"
          />
        )}
        <div
          className={`${
            isShrunk
              ? "translate-y-[-10.2%] rounded-[2%] overflow-hidden w-[100vw] scale-[51%] md:translate-x-[calc(15%-5rem)] h-[75vw]"
              : "w-full h-full"
          } ${transitionActive ? "transition-all duration-1000" : ""}`}
        >
          {children}
        </div>
      </div>

      <AnimatePresence>
        {isShrunk && (
          <motion.div
            initial={{ x: "100%", y: "-50%", opacity: 0 }}
            animate={{ x: 0, y: "-50%", opacity: 1 }}
            exit={{ x: "100%", y: "-50%", opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="fixed z-10 md:z-0 md:bg-transparent bg-neutral1000/70 w-full h-full md:w-[50vw] right-0 top-[50%] flex items-center md:justify-start justify-center p-10 md:pl-[calc(2.5rem+3vw)]"
          >
            {rightChildren}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
