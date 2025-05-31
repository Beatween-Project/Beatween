// src/features/score/hooks/useSongLoading.ts
import { useGlobalStore } from "@/app/store/globalStore";
import { useScoreStore } from "@/features/score/model/useScoreStore";
import {
  fetchSelectedSong,
  fetchAllSheetsBySpace,
} from "@/entities/song/api/songApi";
import { Sheet } from "@/entities/song/types/song.types";
import { useNavigate } from "react-router-dom";
import { toast } from "@/shared/lib/toast";
import { useSongListStore } from "./useSongListStore";

export function useSongLoading() {
  const navigate = useNavigate();

  return async function loadSelectedSongOrPrompt(spaceId: string) {
    const store = useScoreStore.getState();
    const isManager = useGlobalStore.getState().isManager;
    const categories = await fetchAllSheetsBySpace(spaceId);

    useSongListStore.getState().setCategories(categories);

    try {
      const song = await fetchSelectedSong(spaceId);

      if (song && Array.isArray(song.sheets) && song.sheets.length > 0) {
        store.setSelectedSheets(song.sheets);
        store.setSelectedPartSheetUrl(song.sheets[0].sheetUrl);
        store.setParts(song.sheets.map((s: Sheet) => s.part));
        console.log("✅ 선택된 곡 로딩 완료 → /room 이동");
        navigate(`/room/${spaceId}`);
      } else {
        if (isManager) {
          console.log("🎩 매니저입니다 → 곡 목록 조회 시도");
          const categories = await fetchAllSheetsBySpace(spaceId);
          console.log("🎼 곡 목록 결과:", categories);
          // TODO: 곡 목록 상태 저장
          navigate(`/room/${spaceId}`);
        } else {
          if (!isManager) {
            toast.info({
              title: "대기 중",
              message: "관리자가 곡을 선택할 때까지 기다려 주세요.",
            });
          }
          navigate(`/room/${spaceId}`);
        }
      }
    } catch (error) {
      console.error("❌ 곡 로딩 실패:", error);
      toast.error({
        title: "요청 실패",
        message: "곡 정보를 불러오는 데 실패했습니다.",
      });
      navigate(`/room/${spaceId}`);
    }
  };
}
