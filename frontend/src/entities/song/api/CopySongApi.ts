import axiosInstance from "@/shared/api/axiosInstance";
import { ResponseDto } from "../../../shared/types/Response.types";
import { CopySongListByCategoryDto } from "../types/CopySong.types";

export const fetchSongs = async (
  spaceId: number
): Promise<ResponseDto<CopySongListByCategoryDto[]>> => {
  const res = await axiosInstance.get<ResponseDto<CopySongListByCategoryDto[]>>(
    `/api/v1/spaces/${spaceId}/songs/`
  );

  return res.data;
};
