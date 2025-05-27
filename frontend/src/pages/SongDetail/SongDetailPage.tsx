import { useScoreStore as featureScoreStore } from "@/features/score/model/useScoreStore";
import { useCopySheetsBySong } from "@/entities/song/hooks/useCopySheet";
import { EnsembleRoomHeader } from "@/widgets/EnsembleRoomHeader";
import ScoreSheetViewer from "@/widgets/ScoreSheetViewer";
import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import EnsembleRoomFooter from "@/widgets/EnsembleRoomFooter";
import { useInstrumentStore } from "@/features/instrument/model/useInstrumentStore";

export const SongDetailPage = () => {
  const { songId } = useParams();
  const containerRef = useRef<HTMLDivElement>(null);

  if (!songId) return <div>잘못된 접근입니다</div>;

  const { data, isLoading, isError } = useCopySheetsBySong(Number(songId));

  const setSelectedSheets = featureScoreStore(
    (state) => state.setSelectedSheets
  );
  const setParts = featureScoreStore((state) => state.setParts);
  const setInstrument = useInstrumentStore((state) => state.setInstrument);

  useEffect(() => {
    if (data && data.data.length > 0) {
      setSelectedSheets(data.data);
      const parts = data.data.map((sheet) => sheet.part);
      setParts(parts);

      setInstrument(parts[0]);
    }
  }, [data, setSelectedSheets, setParts, setInstrument]);

  if (isLoading) {
    return <div className="w-full h-full">now loading...</div>;
  }

  if (isError) {
    return (
      <div className="text-neutral1000">
        접근 권한이 없거나 존재하지 않는 곡입니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white relative">
      <EnsembleRoomHeader />
      <ScoreSheetViewer containerRef={containerRef} />
      <EnsembleRoomFooter containerRef={containerRef} />
    </div>
  );
};
