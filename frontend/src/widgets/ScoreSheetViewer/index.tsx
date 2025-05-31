import React, { useEffect, useRef } from "react";
import { useScoreStore } from "@/features/score/model/useScoreStore";
import { useMeasureHighlight } from "@/features/score/hooks/useMeasureHighlight";
import { useVerovioLoader } from "@/features/score/hooks/useVerovioLoader";
import { PlayControl } from "@/widgets/PlayControl";
import { useGlobalStore } from "@/app/store/globalStore";
import { useHeaderFooterStore } from "@/app/store/headerFooterStore";
import { useSocketStore } from "@/app/store/socketStore";
import { useInstrumentStore } from "@/features/instrument/model/useInstrumentStore";
import axiosInstance from "@/shared/api/axiosInstance";
import { Sheet } from "@/entities/song/types/song.types";

interface ScoreSheetViewerProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const ScoreSheetViewer: React.FC<ScoreSheetViewerProps> = ({
  containerRef,
}) => {
  const {
    isFullscreen,
    currentMeasure,
    systems,
    isPlaying,
    selectedSheets,
    setSelectedSheets,
    setParts,
    setBpm,
    reset,
  } = useScoreStore();

  const { setShowHeaderFooter } = useHeaderFooterStore();
  const spaceId = useSocketStore((state) => state.spaceId);
  const selectedPart = useInstrumentStore((s) => s.selected);
  const setInstrument = useInstrumentStore((s) => s.setInstrument);
  const hasSelectedSong = useGlobalStore((s) => s.hasSelectedSong);
  const setHasSelectedSong = useGlobalStore((s) => s.setHasSelectedSong);

  useVerovioLoader(containerRef);
  useMeasureHighlight(containerRef);

  const lastSystemIndexRef = useRef<number | null>(null);

  // 🌟 [NEW] 초기 곡 선택 상태 확인 및 초기화
  useEffect(() => {
    const initializeSelectedSong = async () => {
      if (!spaceId) return;
      try {
        const res = await axiosInstance.get(
          `/api/v1/play/spaces/${spaceId}/selected-song`
        );
        const data = res.data?.data;
        if (!data?.copySongId) {
          console.warn("🎵 선택된 곡 없음 → 상태 초기화");
          reset();
          setHasSelectedSong(false);
        } else {
          console.log("✅ 선택된 곡 확인됨 → 상태 유지");
          setSelectedSheets(data.sheets || []);
          setParts(data.sheets.map((s: Sheet) => s.part));
          setBpm(data.bpm || 120); // 곡에서 bpm 받아오기
          setHasSelectedSong(true);
        }
      } catch (err) {
        console.error("❌ 선택된 곡 조회 실패", err);
        reset();
        setHasSelectedSong(false);
      }
    };

    initializeSelectedSong();
  }, [spaceId]);

  useEffect(() => {
    if (!selectedPart && selectedSheets.length > 0) {
      setInstrument(selectedSheets[0].part);
    }
  }, [selectedSheets, selectedPart, setInstrument]);

  useEffect(() => {
    const targetSheet = selectedSheets.find((s) => s.part === selectedPart);
    if (hasSelectedSong && targetSheet?.copySheetId && spaceId) {
      const fetchSheetWithDrawing = async () => {
        try {
          const res = await axiosInstance.get(
            `/api/v1/play/sheets/${targetSheet.copySheetId}/with-drawing`,
            { params: { spaceId } }
          );
          console.log("🎨 시트+드로이어 데이터:", res.data);
        } catch (error) {
          console.error("❌ 시트+드로이를 로드 실패:", error);
        }
      };
      fetchSheetWithDrawing();
    }
  }, [hasSelectedSong, selectedPart, selectedSheets, spaceId]);

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
        </div>
      </div>

      <div className="absolute bottom-4 left-4">
        <PlayControl />
      </div>
    </div>
  );
};

export default ScoreSheetViewer;
