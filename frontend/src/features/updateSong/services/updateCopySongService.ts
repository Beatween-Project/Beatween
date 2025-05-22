import { ResponseDto } from "@/shared/types/Response.types";
import { UpdateSongRequestDto } from "../types/updateCopySong.types";
import { updateSongApi } from "../api/updateCopySongApi";

export const updateSong = async (
  spaceId: number,
  songId: number,
  formData: FormData
): Promise<ResponseDto<UpdateSongRequestDto>> => {
  try {
    return await updateSongApi(spaceId, songId, formData);
  } catch (err) {
    console.error("Failed to update song:", err);
    throw err;
  }
};
