import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LandingPage } from "@/pages/Landing/index";
import { SignPage } from "@/pages/Sign";
import { PersonalSpacePage } from "@/pages/PersonalSpace";
import { TeamSpacePage } from "@/pages/TeamSpace";
// import { ScorePage } from '@/pages/Score';
import { LayoutShrink } from "../layouts/LayoutShrink";
import PageKakaoRedirect from "@/features/auth/kakao/ui/PageKakaoRedirect";
import { LayoutSwitcher } from "../layouts/LayoutSwitcher";
import { SpaceLayout } from "@/widgets/SpaceLayout";
import { LayoutDefault } from "../layouts/LayoutDefault";
import { TestPlaywithPage, TestSheetPage } from "@/pages/Test";
import EnsembleRoom from "@/pages/EnsembleRoom/EnsembleRoom";
import { LocalSignUpPage } from "@/features/auth/local/ui/LocalSignUpPage";
import { LocalSignInPage } from "@/features/auth/local/ui/LocalSignInPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LayoutSwitcher />,
    children: [
      {
        element: <SpaceLayout />,
        children: [
          {
            index: true,
            element: <PersonalSpacePage />,
          },
          {
            path: "/team/:teamId",
            element: <TeamSpacePage />,
          },
        ],
      },
    ],
  },
  {
    path: "/sign",
    element: (
      <LayoutShrink
        bgColor="black"
        children={<LandingPage />}
        rightChildren={<SignPage />}
        initialShrunk={true}
      />
    ),
  },
  {
    path: import.meta.env.VITE_KAKAO_REDIRECT_URI,
    element: <PageKakaoRedirect />,
  },
  {
    path: "/room/:roomId",
    element: <EnsembleRoom />,
  },
  {
    path: "/test/sheet",
    element: (
      <LayoutDefault bgColor="black" noScroll>
        <TestSheetPage />
      </LayoutDefault>
    ),
  },
  {
    path: "/test/playwith/:spaceId",
    element: (
      <LayoutDefault bgColor="black" noScroll>
        <TestPlaywithPage />
      </LayoutDefault>
    ),
  },
  {
    path: "/signup",
    element: (
      <LayoutDefault bgColor="black" noScroll noSignButton>
        <LocalSignUpPage />
      </LayoutDefault>
    ),
  },
  {
    path: "/signin",
    element: (
      <LayoutDefault bgColor="black" noScroll noSignButton>
        <LocalSignInPage />
      </LayoutDefault>
    ),
  },
  //   {
  //     path: '/score/:scoreId',
  //     element: <ScorePage />,
  //   },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
