import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { EnsembleRoomHeader } from "@/widgets/EnsembleRoomHeader";
import ScoreSheetViewer from "@/widgets/ScoreSheetViewer";
import EnsembleRoomFooter from "@/widgets/EnsembleRoomFooter";
import { usePlaySync } from "@/shared/hooks/usePlaySync";
import { useManagerCheck } from "@/shared/hooks/useManagerCheck";
import ScoreSelectModal from "@/widgets/ScoreSelectModal/ScoreSelectModal";
import CanvasOverlay from "@/features/draw/ui/CanvasOverlay";
import { useGlobalStore } from "@/app/store/globalStore";
import { useScoreStore } from "@/features/score/model/useScoreStore";
import { useInstrumentStore } from "@/features/instrument/model/useInstrumentStore";
import { useSocketStore } from "@/app/store/socketStore";

export default function EnsembleRoom() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { roomId } = useParams();
  const [selectedColor, setSelectedColor] = useState("#000000");
  const isSocketConnected = useSocketStore((s) => s.isConnected);

  usePlaySync(roomId ?? "");
  useManagerCheck(roomId ?? "");

  const isDrawing = useGlobalStore((state) => state.isDrawing);
  const clientId = useGlobalStore((state) => state.clientId);
  const stompClient = useSocketStore((state) => state.stompClient);

  const selectedPart = useInstrumentStore((s) => s.selected);
  const selectedSheets = useScoreStore((s) => s.selectedSheets);
  const currentSheet = selectedSheets.find((s) => s.part === selectedPart);
  const sheetId = currentSheet?.copySheetId;

  return (
    <div className="flex flex-col h-screen bg-white relative">
      <ScoreSelectModal spaceId={roomId!} />
      <EnsembleRoomHeader />

      <div
        className="flex-1 overflow-y-auto scroll-custom relative"
        id="score-container"
      >
        <ScoreSheetViewer containerRef={containerRef} />

        {sheetId && (
          <CanvasOverlay
            sheetId={sheetId}
            spaceId={roomId ?? ""}
            userId={clientId.toString()}
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
            stompClient={stompClient}
            isPaletteVisible={isDrawing}
            isSocketConnected={isSocketConnected} // ✅ 추가

          />
        )}
      </div>

      <EnsembleRoomFooter containerRef={containerRef} />
    </div>
  );
}
