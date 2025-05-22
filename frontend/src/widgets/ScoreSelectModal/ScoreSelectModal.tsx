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
import { useInstrumentStore } from "@/features/instrument/model/useInstrumentStore";

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
  const isManager = useGlobalStore((s) => s.isManager);

  const setSelectedSheets = useScoreStore((s) => s.setSelectedSheets);
  const setParts = useScoreStore((s) => s.setParts);
  const setInstrument = useInstrumentStore((s) => s.setInstrument);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchAllSheetsBySpace(spaceId);
        setCategories(data);
        console.log("📥 악보 목록 로드 완료:", data);

        data.forEach((category, idx) => {
          console.log(
            `📂 카테고리[${idx}] - ${category.categoryName}:`,
            category
          );
          category.songs.forEach((song, sidx) => {
            console.log(`🎵 곡[${sidx}] - ${song.title}:`, song);
            console.log(`🎼 시트들:`, song.sheets);
          });
        });
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
          await selectSong(spaceId, selectedSongId);

          const selectedSong = categories
            .flatMap((cat) => cat.songs)
            .find((song) => song.copySongId === selectedSongId);

          if (selectedSong && selectedSong.sheets) {
            const sheets = selectedSong.sheets;
            const parts = sheets.map((sheet) => sheet.part);

            setSelectedSheets(sheets);
            setParts(parts);
            setInstrument(parts[0]);
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
    isManager,
    setSelectedSheets,
    setParts,
    setHasSelectedSong,
    setInstrument,
  ]);

  return null;
}
