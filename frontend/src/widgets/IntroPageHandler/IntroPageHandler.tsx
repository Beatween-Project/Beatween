import { ReactNode, useEffect, useState } from "react";
import { useGlobalStore } from "@/app/store/globalStore";
import { IntroPage } from "@/pages/Intro";

interface IntroPageHandlerProps {
  children: ReactNode;
}

export const IntroPageHandler = ({ children }: IntroPageHandlerProps) => {
  const isLoggedIn = useGlobalStore((state) => state.isLoggedIn);
  const introShown = useGlobalStore((state) => state.introShown);
  const setIntroShown = useGlobalStore((state) => state.setIntroShown);
  const [showIntro, setShowIntro] = useState(!isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn && !introShown) {
      setShowIntro(true);
    }
  }, [isLoggedIn, introShown]);

  const handleIntroFinish = () => {
    setIntroShown(true);
    setShowIntro(false);
  };

  return (
    <>
      {children}
      {showIntro && !introShown && <IntroPage onFinish={handleIntroFinish} />}
    </>
  );

  return null;
};
