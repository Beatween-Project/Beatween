import axiosInstance from "@/shared/api/axiosInstance";

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
): Promise<SongCategory[]> {
  const response = await axiosInstance.get(
    `/api/v1/play/sheets/all/${spaceId}`
  );
  console.log("🎵 악보 전체 조회 응답:", response.data.data); // 추가된 로그

  return response.data.data;
}

export async function selectSong(
  spaceId: string,
  copySongId: number
): Promise<void> {
  await axiosInstance.post(`/api/v1/play/spaces/${spaceId}/selected-song`, {
    copySongId,
  });
}
