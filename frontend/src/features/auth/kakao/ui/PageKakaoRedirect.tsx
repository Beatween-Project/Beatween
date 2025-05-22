// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import { useAuth } from "../../../contexts/AuthContext";
// import { loginWithKakao } from "../services/kakaoService";
// import { useGlobalStore } from "@/app/store/globalStore";

const PageKakaoRedirect = () => {
  //아직 Back 구현이 안 되어 주석 처리
  //   const [searchParams] = useSearchParams();
  // const navigate = useNavigate();
  // const { login } = useGlobalStore();

  //   const code = searchParams.get("code");

  //   useEffect(() => {
  //     if (code) {
  //       loginWithKakao(code, login)
  //         .then((data) => {
  //           if (data.type === "SIGNUP") {
  //             navigate("/welcome");
  //           } else {
  //             navigate("/");
  //           }
  //         })
  //         .catch(() => console.error("로그인 처리 중 오류 발생"));
  //     }
  //   }, [code, navigate]);

  // useEffect(() => {
  //   login(true);
  //   navigate("/");
  // });

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-kakao-container">
      <div className="text-kakao-label">로그인 처리 중...</div>
    </div>
  );
};

export default PageKakaoRedirect;
