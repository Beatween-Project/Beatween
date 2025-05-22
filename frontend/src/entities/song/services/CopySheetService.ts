import { fetchCopySheet } from "../api/CopySheetApi";
import { CopySheetResponseDto } from "../types/CopySheet.types";
import { ResponseDto } from "../../../shared/types/Response.types";

export const getCopySheet = async (
  spaceId: number,
  songId: number,
  categoryId: number,
  sheetId: number
): Promise<ResponseDto<CopySheetResponseDto>> => {
  try {
    return await fetchCopySheet(spaceId, songId, categoryId, sheetId);
  } catch (err) {
    console.error("Failed to get copy sheet", err);
    throw err;
  }
};
