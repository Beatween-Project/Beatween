import { ResponseDto } from "@/shared/types/Response.types";
import { DeleteSongParams } from "../types/deleteCopySong.types";
import { deleteSong } from "../api/deleteCopySong";

export const removeSong = async (
  params: DeleteSongParams
): Promise<ResponseDto<null>> => {
  try {
    return await deleteSong(params);
  } catch (err) {
    console.error("Failed to delete song:", err);
    throw err;
  }
};
