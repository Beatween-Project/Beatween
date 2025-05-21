// import Buttonkakao from "@/features/auth/kakao/ui/ButtonKakao";
import { ButtonLocalLogin } from "@/features/auth/local/ui/ButtonLocalLogin";

export const SignPage = () => {
  // const REDIRECT_URI =
  //   import.meta.env.VITE_APP_BASE_URL + import.meta.env.VITE_KAKAO_REDIRECT_URI;

  // const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${
  //   import.meta.env.VITE_KAKAO_CLIENT_ID
  // }&redirect_uri=${REDIRECT_URI}&response_type=code`;

  // const handleLoginClick = () => {
  //   window.location.href = KAKAO_AUTH_URL;
  // };

  return (
    <div className="w-fit max-w-full h-full flex flex-col justify-center items-center gap-12">
      <div className="font-cafe24 text-brandcolor200 text-2xl">
        박자로 이어지는 우리 사이
      </div>
      <ButtonLocalLogin />
      {/* <Buttonkakao onClick={handleLoginClick} /> */}
    </div>
  );
};
