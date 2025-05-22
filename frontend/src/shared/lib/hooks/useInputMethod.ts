import { useEffect, useState } from "react";

type InputMethod = "mouse" | "touch";

export const useInputMethod = (): InputMethod => {
  const [inputMethod, setInputMethod] = useState<InputMethod>("mouse");

  useEffect(() => {
    const handleTouchStart = () => setInputMethod("touch");
    const handleMouseMove = () => setInputMethod("mouse");

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return inputMethod;
};
