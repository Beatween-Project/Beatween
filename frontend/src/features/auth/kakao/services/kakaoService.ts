import { postKakaoLogin } from "../api/kakao";

export const loginWithKakao = async (
  code: string,
  login: (token: string) => void
) => {
  const data = await postKakaoLogin(code);

  if (data.token) {
    login(data.token);
  }

  return data;
};
