import { useUserStore } from "@/features/user/model/useUserStore";
import { useGlobalStore } from "@/app/store/globalStore";
import { useSocketStore } from "@/app/store/socketStore";
import { InstrumentDropdown } from "@/features/instrument/ui/InstrumentDropdown";
import { useNavigate } from "react-router-dom";
import { Icon } from "@/shared/ui/Icon";
import { Button } from "@/shared/ui/Button";
import { useHeaderFooterStore } from "@/app/store/headerFooterStore";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

export function EnsembleRoomHeader() {
  const { avatarUrl } = useUserStore();
  const navigate = useNavigate();
  const { roomId } = useParams();

  const isPlaying = useGlobalStore((state) => state.isPlaying);
  const { showHeaderFooter } = useHeaderFooterStore();
  const { disconnectWithCleanup, setSpaceId, spaceId } = useSocketStore();
  const isDrawing = useGlobalStore((state) => state.isDrawing);
  const setIsDrawing = useGlobalStore((state) => state.setIsDrawing);

  const currentSpaceId = String(roomId ?? "unknown");

  useEffect(() => {
    if (currentSpaceId && currentSpaceId !== "unknown") {
      setSpaceId(currentSpaceId);
      console.log("🎯 [Header] spaceId를 store에 설정:", currentSpaceId);
    }

    // 접속 시 기본 드로잉 비활성화 상태 설정 (콘솔로 확인)
    setIsDrawing(false);
    console.log("🖌️ 기본 드로잉 상태:", false);
  }, [currentSpaceId, setSpaceId, setIsDrawing]);

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

  useEffect(() => {
    const handlePaletteOpen = () => {
      setIsDrawing(true);
      console.log("🎨 색상 선택기 열림 → 드로잉 활성화 true");
    };
    window.addEventListener("open-color-picker", handlePaletteOpen);
    return () =>
      window.removeEventListener("open-color-picker", handlePaletteOpen);
  }, [setIsDrawing]);

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
            <InstrumentDropdown className="text-black font-medium text-xs border-none outline-none h-full leading-none py-0 my-0" />
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
