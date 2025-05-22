import axiosInstance from "@/shared/api/axiosInstance";
import { ResponseDto } from "@/shared/types/Response.types";

export const updateProfileApi = async (
  formData: FormData
): Promise<ResponseDto<string>> => {
  const res = await axiosInstance.patch<ResponseDto<string>>(
    "/api/v1/users/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
};
