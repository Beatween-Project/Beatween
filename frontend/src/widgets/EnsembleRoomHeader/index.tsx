import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserStore } from "@/features/user/model/useUserStore";
import { useGlobalStore } from "@/app/store/globalStore";
import { useSocketStore } from "@/app/store/socketStore";
import { useHeaderFooterStore } from "@/app/store/headerFooterStore";
import { InstrumentDropdown } from "@/features/instrument/ui/InstrumentDropdown";
import { useScoreStore } from "@/features/score/model/useScoreStore";
import { Icon } from "@/shared/ui/Icon";
import { Button } from "@/shared/ui/Button";
import { fetchSelectedSong } from "@/entities/song/api/songApi";

export function EnsembleRoomHeader() {
  const { avatarUrl } = useUserStore();
  const navigate = useNavigate();
  const { roomId } = useParams();

  const isPlaying = useGlobalStore((state) => state.isPlaying);
  const isManager = useGlobalStore((state) => state.isManager);
  const setHasSelectedSong = useGlobalStore((state) => state.setHasSelectedSong);

  const { showHeaderFooter } = useHeaderFooterStore();
  const { disconnectWithCleanup, setSpaceId } = useSocketStore();
  const isDrawing = useGlobalStore((state) => state.isDrawing);
  const setIsDrawing = useGlobalStore((state) => state.setIsDrawing);

  const parts = useScoreStore((state) => state.parts);
  const setSelectedSheets = useScoreStore((state) => state.setSelectedSheets);
  const setParts = useScoreStore((state) => state.setParts);

  const currentSpaceId = String(roomId ?? "unknown");

  useEffect(() => {
    if (currentSpaceId && currentSpaceId !== "unknown") {
      setSpaceId(currentSpaceId);
      setIsDrawing(false);
    }
  }, [currentSpaceId, setSpaceId, setIsDrawing]);

  useEffect(() => {
    if (currentSpaceId && typeof isManager === "boolean") {
      fetchSelectedSong(currentSpaceId)
        .then((selectedSong) => {
          if (!selectedSong || !selectedSong.copySongId) {
            if (isManager) return;
            return;
          }
          const sheets = selectedSong.sheets ?? [];
          if (sheets.length > 0) {
            setSelectedSheets(sheets);
            setParts(sheets.map((s) => s.part));
            setHasSelectedSong(true);
          }
        })
        .catch((error) => {
          console.error("🎵 선택된 곡 조회 실패:", error);
        });
    }
  }, [currentSpaceId, isManager]);

  useEffect(() => {
    const handlePaletteOpen = () => {
      setIsDrawing(true);
    };
    window.addEventListener("open-color-picker", handlePaletteOpen);
    return () =>
      window.removeEventListener("open-color-picker", handlePaletteOpen);
  }, [setIsDrawing]);

  const handleExit = async () => {
    await disconnectWithCleanup();
    navigate(-1);
  };

  const handleToggleDrawing = () => {
    setIsDrawing(!isDrawing);
  };

  if (isPlaying && !showHeaderFooter) return null;

  return (
    <header
      onClick={(e) => e.stopPropagation()}
      className="w-full fixed top-0 h-16 z-50 flex items-center justify-between px-4 bg-[#2E3153]/70 backdrop-blur-md"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-4">
          <div className="w-7 h-7 rounded-full overflow-hidden bg-[#1E90FF] flex items-center justify-center">
            <img
              src={avatarUrl || "/placeholder.svg"}
              className="w-5 h-5 object-cover"
              alt="User avatar"
            />
          </div>
          <span className="text-sm font-medium text-white ml-1">
            SSAFY toGether
          </span>
          <div className="flex mx-1">
            <Icon icon="chevron_right" tone="white" size={18} />
          </div>
          <div className="bg-white rounded px-1 flex items-center h-6">
            <InstrumentDropdown
              parts={parts}
              className="text-black font-medium text-xs border-none outline-none h-full leading-none py-0 my-0"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isManager && (
          <div
            className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-400/80"
            title="매니저"
          >
            <Icon icon="crown" tone="white" size={20} />
          </div>
        )}
        {isDrawing ? (
          <>
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent("show-color-picker"));
              }}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/20 transition-all"
            >
              <Icon icon="palette" tone="white" size={24} />
            </button>

            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-400/80">
              <Icon icon="pan_tool" tone="dark" size={20} />
            </div>

            <button
              onClick={() => {
                setIsDrawing(false);
              }}
              className="ml-2 bg-red-400 text-white px-3 py-1.5 rounded-md hover:bg-red-500 text-sm"
            >
              드로잉 종료
            </button>
          </>
        ) : (
          <button
            onClick={handleToggleDrawing}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/20 transition-all"
          >
            <Icon icon="draw" tone="white" size={24} />
          </button>
        )}

        <Button
          color="light"
          className="!bg-[#FF4D79] !text-white hover:!bg-[#e04e4e] whitespace-nowrap px-3 py-1.5 rounded-md text-sm"
          icon="logout"
          onClick={handleExit}
        >
          합주 방 나가기
        </Button>
      </div>
    </header>
  );
}