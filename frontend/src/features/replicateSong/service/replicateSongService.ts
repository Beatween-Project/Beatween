import { ResponseDto } from "@/shared/types/Response.types";
import { ReplicateSongRequest } from "../types/replicateSong.types";
import { CopySongDto } from "@/entities/song/types/CopySong.types";
import { replicateSongApi } from "../api/replicateSongApi";

export const replicateSongService = async (
  spaceId: number,
  songId: number,
  data: ReplicateSongRequest
): Promise<ResponseDto<CopySongDto>> => {
  try {
    const res = await replicateSongApi(spaceId, songId, data);
    return res;
  } catch (err) {
    console.error("곡 복제 실패:", err);
    throw err;
  }
};
