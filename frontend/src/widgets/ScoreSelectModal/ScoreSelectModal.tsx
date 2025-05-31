import { useEffect, useState } from "react";
import {
  fetchAllSheetsBySpace,
  fetchSelectedSong,
  selectSong,
} from "@/entities/song/api/songApi";
import { openModal, closeModal } from "@/shared/lib/modal";
import { useGlobalStore } from "@/app/store/globalStore";
import { useScoreStore } from "@/features/score/model/useScoreStore";
import { AxiosError } from "axios";
import { useInstrumentStore } from "@/features/instrument/model/useInstrumentStore";
import { useSongListStore } from "@/features/score/hooks/useSongListStore";

interface ScoreSelectModalProps {
  spaceId: string;
}

export default function ScoreSelectModal({ spaceId }: ScoreSelectModalProps) {
  const categories = useSongListStore((s) => s.categories);
  const setCategories = useSongListStore((s) => s.setCategories);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSongId, setSelectedSongId] = useState<number | null>(null);

  const setHasSelectedSong = useGlobalStore((s) => s.setHasSelectedSong);
  const isManager = useGlobalStore((s) => s.isManager);

  const setSelectedSheets = useScoreStore((s) => s.setSelectedSheets);
  const setParts = useScoreStore((s) => s.setParts);
  const setInstrument = useInstrumentStore((s) => s.setInstrument);
  const selectedInstrument = useInstrumentStore((s) => s.selected);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchAllSheetsBySpace(spaceId);
        setCategories(data);
        console.log("🔄 악보 목록 불러오기 시도");
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
    if (typeof isManager !== "boolean") return;

    const checkAndShowModal = async () => {
      try {
        const selectedSong = await fetchSelectedSong(spaceId);
        if (selectedSong?.copySongId) {
          console.log("✅ 이미 곡이 선택되어 있음 → 모달 생략");
          setHasSelectedSong(true);
          return;
        }
      } catch (error) {
        console.error("❌ 곡 정보 확인 실패:", error);
      }

      if (isManager && categories.length > 0) {
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
                if (!parts.includes(selectedInstrument)) {
                  setInstrument(parts[0]);
                }
                setHasSelectedSong(true);
                closeModal();
                console.log("✅ 곡 선택 성공, 파트 정보:", parts);
              } else {
                console.error("❌ 선택된 곡이 없거나 시트 정보가 없습니다.");
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
      }
    };

    if (!isManager) {
      (async () => {
        try {
          const selectedSong = await fetchSelectedSong(spaceId);
          if (!selectedSong || !selectedSong.copySongId) {
            console.warn("⚠️ 선택된 곡 없음 또는 무효한 응답");
            return;
          }

          let sheets = selectedSong.sheets ?? [];

          if (sheets.length === 0 && categories.length > 0) {
            const matched = categories
              .flatMap((cat) => cat.songs)
              .find((song) => song.copySongId === selectedSong.copySongId);
            if (matched?.sheets) {
              sheets = matched.sheets;
              console.log("🔄 시트 정보 보완 완료");
            }
          }

          if (sheets.length > 0) {
            const parts = sheets.map((sheet) => sheet.part);
            setSelectedSheets(sheets);
            setParts(parts);
            if (!parts.includes(selectedInstrument)) {
              setInstrument(parts[0]);
            }
            setHasSelectedSong(true);
            console.log("✅ 선택된 곡 정보 설정 완료:", parts);
          } else {
            console.error("❌ 선택된 곡 정보가 없거나 시트 정보가 없습니다.");
          }
        } catch (error) {
          console.error("❌ 선택된 곡 정보 불러오기 실패:", error);
        }
      })();
    } else {
      checkAndShowModal();
    }
  }, [
    selectedCategoryId,
    selectedSongId,
    spaceId,
    isManager,
    categories,
    setSelectedSheets,
    setParts,
    setHasSelectedSong,
    setInstrument,
    selectedInstrument,
  ]);

  return null;
}
