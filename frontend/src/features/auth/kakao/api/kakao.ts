import axios from "axios"; //객체 pull 받고 수정하기

export const postKakaoLogin = async (code: string) => {
  const res = await axios.post("/auth/kakao", { code });
  return res.data;
};
