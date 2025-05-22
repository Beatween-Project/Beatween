import { ResponseDto } from "@/shared/types/Response.types";
import axiosInstance from "@/shared/api/axiosInstance";
import { UserInfoDto } from "../types/User.types";

export const fetchUserInfo = async (): Promise<ResponseDto<UserInfoDto>> => {
  const res = await axiosInstance.get<ResponseDto<UserInfoDto>>(
    "/api/v1/users/info"
  );
  return res.data;
};
