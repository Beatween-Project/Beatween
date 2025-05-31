import axiosInstance from "@/shared/api/axiosInstance";

export interface SheetData {
  copySheetId: number;
  part: string;
  sheetUrl: string;
}

export interface Song {
  copySongId: number;
  title: string;
  bpm: number; // ✅ 추가
  sheets: SheetData[];
}

export interface SongCategory {
  categoryId: number;
  categoryName: string;
  songs: Song[];
}

// 🔹 전체 악보 + 곡 목록 조회
export async function fetchAllSheetsBySpace(
  spaceId: string
): Promise<SongCategory[]> {
  const response = await axiosInstance.get(
    `/api/v1/play/sheets/all/${spaceId}`
  );
  console.log("🎵 악보 전체 조회 응답:", response.data.data);
  return response.data.data;
}

// 🔸 선택된 곡 조회
export async function fetchSelectedSong(spaceId: string): Promise<Song | null> {
  try {
    const response = await axiosInstance.get(
      `/api/v1/play/spaces/${spaceId}/selected-song`
    );
    const song = response.data?.data;
    if (!song?.copySongId) return null;

    return song; // 포함된 sheets 정보도 함께 반환
  } catch (error) {
    console.error("❌ 선택된 곡 조회 실패:", error);
    return null;
  }
}

// ✅ 곡 선택 요청
export async function selectSong(
  spaceId: string,
  copySongId: number
): Promise<void> {
  await axiosInstance.post(`/api/v1/play/spaces/${spaceId}/selected-song`, {
    copySongId,
  });
}
