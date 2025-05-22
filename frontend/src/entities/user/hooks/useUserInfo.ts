import { ResponseDto } from "@/shared/types/Response.types";
import { useQuery } from "@tanstack/react-query";
import { getUserInfo } from "../services/UserService";
import { UserInfoDto } from "../types/User.types";

export const useUserInfo = () => {
  return useQuery<ResponseDto<UserInfoDto>, Error>({
    queryKey: ["userInfo"],
    queryFn: getUserInfo,
  });
};
