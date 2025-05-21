// ScoreSelectModal.tsx
import { useEffect, useState } from "react";
import {
  fetchAllSheetsBySpace,
  SongCategory,
  selectSong,
} from "@/entities/song/api/songApi";
import { openModal, closeModal } from "@/shared/lib/modal";
import { useGlobalStore } from "@/app/store/globalStore";
import { useScoreStore } from "@/features/score/model/useScoreStore";
import { AxiosError } from "axios";

interface ScoreSelectModalProps {
  spaceId: string;
}

export default function ScoreSelectModal({ spaceId }: ScoreSelectModalProps) {
  const [categories, setCategories] = useState<SongCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [selectedSongId, setSelectedSongId] = useState<number | null>(null);

  const setHasSelectedSong = useGlobalStore((s) => s.setHasSelectedSong);
  const userId = useGlobalStore((s) => s.clientId);
  const isManager = useGlobalStore((s) => s.isManager);

  const setSelectedSheets = useScoreStore((s) => s.setSelectedSheets);
  // 새로 추가: setParts 함수 가져오기
  const setParts = useScoreStore((s) => s.setParts);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchAllSheetsBySpace(spaceId);
        setCategories(data);
        console.log("📥 악보 목록 로드 완료:", data);

        // 추가 디버깅: 카테고리 데이터 더 자세히 로그
        if (data && data.length > 0) {
          console.log("🔍 첫 번째 카테고리:", data[0]);
          if (data[0].songs && data[0].songs.length > 0) {
            console.log("🔍 첫 번째 곡:", data[0].songs[0]);
            if (data[0].songs[0].sheets) {
              console.log("🔍 첫 번째 곡의 sheets:", data[0].songs[0].sheets);
              // sheets의 part 정보 확인
              const parts = data[0].songs[0].sheets.map((sheet) => sheet.part);
              console.log("🔍 첫 번째 곡에서 추출한 파트들:", parts);
            }
          }
        }
      } catch (e) {
        console.error("❌ 악보 목록 불러오기 실패:", e);
      }
    }
    fetchData();
  }, [spaceId]);

  useEffect(() => {
    const handlePopState = () => {
      closeModal();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!Array.isArray(categories) || categories.length === 0 || !isManager)
      return;

    openModal({
      title: "곡 선택",
      okText: "선택하기",
      buttonType: "default",
      onConfirm: async () => {
        if (!selectedSongId) return;

        try {
          await selectSong(spaceId, userId, selectedSongId);

          const selectedSong = categories
            .flatMap((cat) => cat.songs)
            .find((song) => song.copySongId === selectedSongId);

          if (selectedSong && selectedSong.sheets) {
            // sheets 배열 확인
            const sheets = selectedSong.sheets;

            // 각 sheet 객체의 구조 확인
            if (sheets.length > 0) {
            }

            // 파트 추출 - sheets 배열의 각 항목에서 part 속성 추출
            const parts = sheets.map((sheet) => sheet.part);
            console.log("🔍 추출된 파트 배열:", parts);

            // 상태 업데이트 전 확인
            console.log("🔍 상태 업데이트 전 store:", {
              sheets: useScoreStore.getState().selectedSheets,
              parts: useScoreStore.getState().parts,
            });

            // 상태 업데이트
            setSelectedSheets(sheets);
            setParts(parts);

            // 상태 업데이트 직후 확인
            console.log("🔍 상태 업데이트 직후 store:", {
              sheets: useScoreStore.getState().selectedSheets,
              parts: useScoreStore.getState().parts,
            });

            // 1초 후 상태 다시 확인
            setTimeout(() => {
              const storeState = useScoreStore.getState();
              console.log("🕒 1초 후 store의 상태:", {
                sheets: storeState.selectedSheets,
                parts: storeState.parts,
              });
            }, 1000);

            setHasSelectedSong(true);
            closeModal();
            console.log("✅ 곡 선택 성공, 파트 정보:", parts);
          } else {
            console.error("❌ selectedSong이 없거나 sheets 정보가 없습니다.");
          }
        } catch (error) {
          const e = error as AxiosError;
          console.error("❌ 곡 선택 서버 전송 실패:", e);
          if (e.response) {
            console.error("📥 서버 응답 데이터:", e.response.data);
            console.error("📊 상태 코드:", e.response.status);
            console.error("📋 응답 헤더:", e.response.headers);
          }
        }
      },
      children: (
        <div className="space-y-4">
          {/* 카테고리 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              카테고리
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-800"
              value={selectedCategoryId?.toString() ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedCategoryId(val ? Number(val) : null);
                setSelectedSongId(null);
              }}
            >
              <option value="">카테고리 선택</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>

          {/* 곡 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              곡
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-800"
              value={selectedSongId?.toString() ?? ""}
              onChange={(e) =>
                setSelectedSongId(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              disabled={selectedCategoryId === null}
            >
              <option value="">곡 선택</option>
              {categories
                .find((cat) => cat.categoryId === selectedCategoryId)
                ?.songs.map((song) => (
                  <option key={song.copySongId} value={song.copySongId}>
                    {song.title}
                  </option>
                ))}
            </select>
          </div>
        </div>
      ),
    });
  }, [
    categories,
    selectedCategoryId,
    selectedSongId,
    spaceId,
    userId,
    isManager,
    setSelectedSheets,
    setParts, // 새로 추가: 의존성 배열에 setParts 추가
    setHasSelectedSong,
  ]);

  return null;
}
