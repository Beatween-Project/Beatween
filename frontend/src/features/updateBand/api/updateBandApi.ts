import axiosInstance from "@/shared/api/axiosInstance";
import { ResponseDto } from "@/shared/types/Response.types";
import { SpaceDetailResponseDto } from "../types/updateBand.types";

export const updateBandApi = async (
  spaceId: number,
  formData: FormData
): Promise<ResponseDto<SpaceDetailResponseDto>> => {
  console.log(spaceId);
  for (const [key, value] of formData.entries()) {
    console.log(key, value);
  }

  const res = await axiosInstance.patch<ResponseDto<SpaceDetailResponseDto>>(
    `/api/v1/spaces/${spaceId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
};
