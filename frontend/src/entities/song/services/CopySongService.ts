import { ResponseDto } from "../../../shared/types/Response.types";
import { fetchSongs } from "../api/CopySongApi";
import { CopySongListByCategoryDto } from "../types/CopySong.types";

export const getAllSongs = async (
  spaceId: number
): Promise<ResponseDto<CopySongListByCategoryDto[]>> => {
  try {
    return await fetchSongs(spaceId);
  } catch (err) {
    console.error("Failed to get copy sheet", err);
    throw err;
  }
};
