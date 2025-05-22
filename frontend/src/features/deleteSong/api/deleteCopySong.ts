import axiosInstance from "@/shared/api/axiosInstance";
import { ResponseDto } from "@/shared/types/Response.types";
import { DeleteSongParams } from "../types/deleteCopySong.types";

export const deleteSong = async ({
  spaceId,
  songId,
}: DeleteSongParams): Promise<ResponseDto<null>> => {
  const res = await axiosInstance.delete<ResponseDto<null>>(
    `/api/v1/spaces/${spaceId}/songs/${songId}`
  );
  return res.data;
};
