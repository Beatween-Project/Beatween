import { ResponseDto } from "@/shared/types/Response.types";
import { ReplicateSongRequest } from "../types/replicateSong.types";
import { CopySongDto } from "@/entities/song/types/CopySong.types";
import axiosInstance from "@/shared/api/axiosInstance";

export const replicateSongApi = async (
  spaceId: number,
  songId: number,
  data: ReplicateSongRequest
): Promise<ResponseDto<CopySongDto>> => {
  const res = await axiosInstance.post<ResponseDto<CopySongDto>>(
    `/api/v1/spaces/${spaceId}/songs/${songId}`,
    data
  );

  return res.data;
};
