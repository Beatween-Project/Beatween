import axiosInstance from "@/shared/api/axiosInstance";
import { CopySheetResponseDto } from "../types/CopySheet.types";
import { ResponseDto } from "../../../shared/types/Response.types";

export const fetchCopySheet = async (
  spaceId: number,
  songId: number,
  categoryId: number,
  sheetId: number
): Promise<ResponseDto<CopySheetResponseDto>> => {
  const res = await axiosInstance.get<ResponseDto<CopySheetResponseDto>>(
    `/api/v1/spaces/${spaceId}/songs/${songId}/categories/${categoryId}/sheets/${sheetId}`
  );

  return res.data;
};
