import axiosInstance from "@/shared/api/axiosInstance";
import { ResponseDto } from "@/shared/types/Response.types";

export const updateProfileApi = async (
  formData: FormData
): Promise<ResponseDto<null>> => {
  const res = await axiosInstance.patch<ResponseDto<null>>(
    "/api/v1/profile",
    formData
  );
  return res.data;
};
