import axiosInstance from "@/shared/api/axiosInstance";
import { ResponseDto } from "@/shared/types/Response.types";

export const fetchInviteLink = async (
  spaceId: number
): Promise<ResponseDto<string>> => {
  const res = await axiosInstance.get<ResponseDto<string>>(
    `/api/v1/spaces/teams/${spaceId}`
  );
  return res.data;
};
