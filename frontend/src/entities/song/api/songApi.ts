import axiosInstance from "@/shared/api/axiosInstance";
import { ResponseDto } from "@/shared/types/Response.types";

export interface SheetData {
  copySheetId: number;
  part: string;
  sheetUrl: string;
}

export interface Song {
  copySongId: number;
  title: string;
  sheets: SheetData[];
}

export interface SongCategory {
  categoryId: number;
  categoryName: string;
  songs: Song[];
}

export async function fetchAllSheetsBySpace(
  spaceId: string
): Promise<ResponseDto<SongCategory[]>> {
  const response = await axiosInstance.get(
    `/api/v1/play/sheets/all/${spaceId}`
  );
  return response.data;
}

export async function selectSong(
  spaceId: string,
  userId: number,
  copySongId: number
): Promise<void> {
  await axiosInstance.post(`/api/v1/spaces/${spaceId}/selected-song`, {
    userId,
    copySongId,
  });
}
