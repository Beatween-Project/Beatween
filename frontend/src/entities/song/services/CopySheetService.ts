import { fetchCopySheet, fetchCopySheetsBySong } from "../api/CopySheetApi";
import { CopySheetResponseDto } from "../types/CopySheet.types";
import { ResponseDto } from "../../../shared/types/Response.types";
import { SheetInfoResponse } from "../types/song.types";

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

export const getCopySheetsBySong = async (
  copySongId: number
): Promise<ResponseDto<SheetInfoResponse[]>> => {
  try {
    return await fetchCopySheetsBySong(copySongId);
  } catch (err) {
    console.error("Failed to get copy sheets", err);
    throw err;
  }
};
