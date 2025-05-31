import React, { useEffect, useRef, useState } from "react";
import { useScoreStore } from "@/features/score/model/useScoreStore";
import { useMeasureHighlight } from "@/features/score/hooks/useMeasureHighlight";
import { useVerovioLoader } from "@/features/score/hooks/useVerovioLoader";
import { PlayControl } from "@/widgets/PlayControl";
import { usePlaySync } from "@/shared/hooks/usePlaySync";
import { useGlobalStore } from "@/app/store/globalStore";
import { useHeaderFooterStore } from "@/app/store/headerFooterStore";
import { useSocketStore } from "@/app/store/socketStore";
import CanvasOverlay from "@/features/draw/ui/CanvasOverlay"; // 드로잉 컴포넌트 경로 맞춰주세요
import { Icon } from "@/shared/ui/Icon";
import { AnimatePresence, motion } from "framer-motion";

interface ScoreSheetViewerProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const ScoreSheetViewer: React.FC<ScoreSheetViewerProps> = ({
  containerRef,
}) => {
  const { isFullscreen, currentMeasure, systems, isPlaying } = useScoreStore();
  const { setShowHeaderFooter } = useHeaderFooterStore();
  const clientId = useGlobalStore((s) => s.clientId);
  const isDrawing = useGlobalStore((s) => s.isDrawing);
  const stompClient = useSocketStore((s) => s.stompClient);
  const isSocketConnected = useSocketStore((s) => s.isConnected);

  const { isLoading } = useVerovioLoader(containerRef);
  const [selectedColor, setSelectedColor] = useState("#000000");

  usePlaySync("1");
  useVerovioLoader(containerRef);
  useMeasureHighlight(containerRef);

  const lastSystemIndexRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      console.log("🧪 scrollHeight:", container.scrollHeight);
      console.log("🧪 clientHeight:", container.clientHeight);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || !isPlaying) return;

    const currentSystemIndex = systems.findIndex((sys) =>
      sys.measureIds.includes(currentMeasure)
    );

    if (currentSystemIndex === -1) return;

    const currentSystem = systems[currentSystemIndex].el as SVGGraphicsElement;

    currentSystem.scrollIntoView({ behavior: "smooth", block: "start" });
    lastSystemIndexRef.current = currentSystemIndex;
  }, [isPlaying]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const systemElements = container.querySelectorAll("g.system");

    if (isPlaying) {
      systemElements.forEach((el) => el.classList.add("dimmed"));
    } else {
      systemElements.forEach((el) => el.classList.remove("dimmed"));
    }

    const currentSystemIndex = systems.findIndex((sys) =>
      sys.measureIds.includes(currentMeasure)
    );
    if (currentSystemIndex === -1) return;

    const currentSystem = systems[currentSystemIndex].el as SVGGraphicsElement;

    if (isPlaying) currentSystem.classList.remove("dimmed");

    if (
      isPlaying &&
      lastSystemIndexRef.current !== currentSystemIndex &&
      lastSystemIndexRef.current !== null
    ) {
      currentSystem.scrollIntoView({ behavior: "smooth", block: "start" });
      lastSystemIndexRef.current = currentSystemIndex;
    }

    if (!isPlaying) {
      lastSystemIndexRef.current = null;
    }
  }, [currentMeasure, systems, isPlaying]);

  const handleTouch = () => {
    if (!isPlaying) return;
    setShowHeaderFooter((prev) => !prev);
  };

  return (
    <div
      className={`relative w-full flex-1 overflow-hidden ${
        isFullscreen ? "bg-black" : "bg-white"
      }`}
      onClick={handleTouch}
    >
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-auto scroll-smooth"
      >
        <div className="relative">
          <div className="h-[20px]" />
          <AnimatePresence>
            {isLoading && (
              <motion.div
                className="fixed inset-0 flex flex-col items-center justify-center bg-neutral1000/70 text-brandcolor200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex animate-spin">
                  <Icon icon="progress_activity" />
                </div>
                <div>악보 불러오는 중</div>
              </motion.div>
            )}
          </AnimatePresence>

          <div id="verovio-container" />

          {isDrawing && (
            <CanvasOverlay
              sheetId={1}
              spaceId="1"
              userId={clientId.toString()}
              selectedColor={selectedColor}
              isPaletteVisible={isDrawing}
              onColorChange={setSelectedColor}
              isSocketConnected={isSocketConnected}
              stompClient={stompClient}
              isDrawing={true} // 또는 상태에서 가져온 값
            />
          )}
        </div>
      </div>

      <div className="absolute bottom-4 left-4">
        <PlayControl />
      </div>
    </div>
  );
};

export default ScoreSheetViewer;
