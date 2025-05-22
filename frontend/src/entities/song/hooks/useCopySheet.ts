import { useQuery } from "@tanstack/react-query";
import { getCopySheet } from "../services/CopySheetService";
import { CopySheetResponseDto } from "../types/CopySheet.types";
import { ResponseDto } from "../../../shared/types/Response.types";

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
