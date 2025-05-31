import { useRef } from "react";
import { useParams } from "react-router-dom";
import { EnsembleRoomHeader } from "@/widgets/EnsembleRoomHeader";
import ScoreSheetViewer from "@/widgets/ScoreSheetViewer";
import EnsembleRoomFooter from "@/widgets/EnsembleRoomFooter";
import { usePlaySync } from "@/shared/hooks/usePlaySync";
import { useManagerCheck } from "@/shared/hooks/useManagerCheck";
import ScoreSelectModal from "@/widgets/ScoreSelectModal/ScoreSelectModal";
import CanvasOverlay from "@/features/draw/ui/CanvasOverlay";
import { useGlobalStore } from "@/app/store/globalStore";

export default function EnsembleRoom() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { roomId } = useParams();

  usePlaySync(roomId ?? "");
  useManagerCheck(roomId ?? "");

  const isDrawing = useGlobalStore((state) => state.isDrawing);

  return (
    <div className="flex flex-col h-screen bg-white relative">
      <ScoreSelectModal spaceId={roomId!} />
      <EnsembleRoomHeader />

      {/* 🎯 악보 + 드로잉을 함께 감싸는 container (relative 기준점) */}
      <div
        className="flex-1 overflow-y-auto scroll-custom relative"
        id="score-container"
      >
        <ScoreSheetViewer containerRef={containerRef} />

        {/* ✅ 악보 위에 드로잉 오버레이 */}
        <CanvasOverlay
          sheetId={123} // 실제 값으로 대체
          spaceId={roomId ?? ""}
          userId={"user-id"} // 실제 사용자 ID로 대체
          selectedColor={"#000000"} // Zustand 등에서 상태 연동 가능
          onColorChange={() => {}}
          isSocketConnected={true}
          stompClient={null}
          isDrawing={isDrawing}
          isPaletteVisible={true} // ✅ 이게 빠졌다는 오류
        />
      </div>

      <EnsembleRoomFooter containerRef={containerRef} />
    </div>
  );
}
