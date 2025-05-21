import { ResponseDto } from "@/shared/types/Response.types";
import { fetchUserInfo } from "../api/UserApi";
import { UserInfoDto } from "../types/User.types";

export const getUserInfo = async (): Promise<ResponseDto<UserInfoDto>> => {
  try {
    return await fetchUserInfo();
  } catch (err) {
    console.error("Failed to fetch user info", err);
    throw err;
  }
};
