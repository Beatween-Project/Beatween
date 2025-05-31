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

export function EnsembleRoomHeader() {
  const { avatarUrl } = useUserStore();
  const navigate = useNavigate();
  const { roomId } = useParams();

  const isPlaying = useGlobalStore((state) => state.isPlaying);
  const { showHeaderFooter } = useHeaderFooterStore();
  const { disconnectWithCleanup, setSpaceId, spaceId } = useSocketStore();
  const isDrawing = useGlobalStore((state) => state.isDrawing);
  const setIsDrawing = useGlobalStore((state) => state.setIsDrawing);

  // 변경: sheet는 로깅용으로만 사용, parts를 직접 가져옴
  const sheets = useScoreStore((state) => state.selectedSheets);
  const parts = useScoreStore((state) => state.parts);

  const currentSpaceId = String(roomId ?? "unknown");

  useEffect(() => {
    console.log("📥 [LOG] useScoreStore의 selectedSheets 상태 확인:", sheets);

    // 디버깅: sheets 배열에서 part 정보 확인
    if (sheets && sheets.length > 0) {
      console.log("🔍 EnsembleRoomHeader - 첫 번째 sheet:", sheets[0]);
      if (sheets[0].part) {
        console.log(
          "🔍 EnsembleRoomHeader - 첫 번째 sheet의 part:",
          sheets[0].part
        );
      } else {
        console.warn(
          "⚠️ EnsembleRoomHeader - sheets[0]에 part 속성이 없습니다"
        );
      }
    }
  }, [sheets]);

  useEffect(() => {
    console.log("🎼 EnsembleRoomHeader - 현재 parts 상태:", parts);
    // 추가 디버깅: store에서 직접 확인
    console.log(
      "🔍 EnsembleRoomHeader - store에서 직접 확인한 parts:",
      useScoreStore.getState().parts
    );
  }, [parts]);

  useEffect(() => {
    console.log("📌 [LOG] 초기 roomId:", roomId);
    console.log("📌 [LOG] 변환된 currentSpaceId:", currentSpaceId);
  }, [roomId, currentSpaceId]);

  useEffect(() => {
    if (currentSpaceId && currentSpaceId !== "unknown") {
      setSpaceId(currentSpaceId);
      console.log("🎯 [Header] spaceId를 store에 설정:", currentSpaceId);
    }

    setIsDrawing(false);
    console.log("🖌️ 기본 드로잉 상태:", false);
  }, [currentSpaceId, setSpaceId, setIsDrawing]);

  useEffect(() => {
    const handlePaletteOpen = () => {
      setIsDrawing(true);
      console.log("🎨 색상 선택기 열림 → 드로잉 활성화 true");
    };
    window.addEventListener("open-color-picker", handlePaletteOpen);
    return () =>
      window.removeEventListener("open-color-picker", handlePaletteOpen);
  }, [setIsDrawing]);

  useEffect(() => {
    console.log("📦 [LOG] 현재 spaceId 상태:", spaceId);
  }, [spaceId]);

  const handleExit = async () => {
    console.log("🚪 [EXIT] 합주방 나가기 시도");
    console.log("🟡 store의 spaceId:", spaceId);
    await disconnectWithCleanup();
    console.log("⏪ [EXIT] 이전 화면으로 이동");
    navigate(-1);
  };

  const handleToggleDrawing = () => {
    const next = !isDrawing;
    setIsDrawing(next);
    console.log("🎨 드로잉 상태 토글:", next);
  };

  if (isPlaying && !showHeaderFooter) return null;

  console.log("🔍 EnsembleRoomHeader 렌더링 시점의 parts:", parts);

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
                console.log("❌ 드로잉 종료 → false");
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
