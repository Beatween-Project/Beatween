import { useGlobalStore } from "@/app/store/globalStore";
import { LayoutShrink } from "../LayoutShrink";
import { LandingPage } from "@/pages/Landing";
import { SignPage } from "@/pages/Sign";
import { LayoutDefault } from "../LayoutDefault";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { IntroPageHandler } from "@/widgets/IntroPageHandler";

export const LayoutSwitcher = () => {
  const isLoggedIn = useGlobalStore((state) => state.isLoggedIn);
  const navigate = useNavigate();

  // 고정 레이아웃이 아닌, Switch되는 레이아웃을 쓰다 보니
  // 분리하지 않고 상위에 둬야 정상 동작해서 함께 두었습니다
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <>
        <IntroPageHandler>
          <LayoutShrink
            bgColor="black"
            children={<LandingPage />}
            rightChildren={<SignPage />}
          />
        </IntroPageHandler>
      </>
    );
  }

  return (
    <LayoutDefault bgColor="black">
      <Outlet />
    </LayoutDefault>
  );
};
