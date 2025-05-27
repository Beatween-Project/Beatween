import { useQuery } from "@tanstack/react-query";
import {
  getCopySheet,
  getCopySheetsBySong,
} from "../services/CopySheetService";
import { CopySheetResponseDto } from "../types/CopySheet.types";
import { ResponseDto } from "../../../shared/types/Response.types";
import { SheetInfoResponse } from "../types/song.types";

export const useCopySheet = (
  spaceId: number,
  songId: number,
  categoryId: number,
  sheetId: number
) => {
  return useQuery<ResponseDto<CopySheetResponseDto>, Error>({
    queryKey: ["copySheet", songId, sheetId],
    queryFn: () => getCopySheet(spaceId!, songId!, categoryId!, sheetId!),
    enabled: !!songId && !!sheetId,
  });
};

export const useCopySheetsBySong = (copySongId: number) => {
  return useQuery<ResponseDto<SheetInfoResponse[]>, Error>({
    queryKey: ["copySheets", copySongId],
    queryFn: () => getCopySheetsBySong(copySongId!),
    enabled: !!copySongId,
  });
};
