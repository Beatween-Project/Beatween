import { RefObject, useEffect } from "react";
import { PlayControl } from "../PlayControl";
import { BpmControlButton } from "./BpmControlButton";
import { useGlobalStore } from "@/app/store/globalStore";
import { useHeaderFooterStore } from "@/app/store/headerFooterStore";

interface EnsembleRoomFooterProps {
  containerRef: RefObject<HTMLDivElement | null>;
}

export default function EnsembleRoomFooter({}: EnsembleRoomFooterProps) {
  const isPlaying = useGlobalStore((state) => state.isPlaying);
  const showHeaderFooter = useHeaderFooterStore(
    (state) => state.showHeaderFooter
  );
  const setShowHeaderFooter = useHeaderFooterStore(
    (state) => state.setShowHeaderFooter
  );

  useEffect(() => {
    if (!isPlaying) {
      setShowHeaderFooter(true);
    }
  }, [isPlaying, setShowHeaderFooter]);

  if (isPlaying && !showHeaderFooter) return null;

  return (
    <footer
      onClick={(e) => e.stopPropagation()}
      className="w-full fixed bottom-0 z-50 bg-[#2E3153]/70 backdrop-blur-md text-white text-sm flex"
    >
      <div className="flex items-center justify-between px-6 py-2 border-t border-white/10 w-full">
        <div className="flex items-center gap-4">
          <PlayControl />
        </div>
        <div className="flex items-center gap-4">
          <BpmControlButton />
        </div>
      </div>
    </footer>
  );
}
