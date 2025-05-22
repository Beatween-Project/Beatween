import axiosInstance from "@/shared/api/axiosInstance";
import { ResponseDto } from "@/shared/types/Response.types";
import { UpdateSongRequestDto } from "../types/updateCopySong.types";

export const updateSongApi = async (
  spaceId: number,
  songId: number,
  formData: FormData
): Promise<ResponseDto<UpdateSongRequestDto>> => {
  const res = await axiosInstance.patch<ResponseDto<UpdateSongRequestDto>>(
    `/api/v1/spaces/${spaceId}/songs/${songId}`,
    formData
  );
  return res.data;
};
