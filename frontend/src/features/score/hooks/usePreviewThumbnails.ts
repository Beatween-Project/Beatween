// features/score/hooks/usePreviewThumbnails.ts
import { useScoreStore } from "@/features/score/model/useScoreStore";

export function usePreviewThumbnails(
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  const thumbnails = useScoreStore((state) => state.thumbnails);
  const isPreviewVisible = useScoreStore((state) => state.isPreviewVisible);
  const togglePreview = useScoreStore((state) => state.togglePreview);

  const handleThumbnailClick = (pageIndex: number) => {
    const container = containerRef.current;
    if (!container) return;

    const target = container.querySelector(
      `.page-wrapper[data-page="${pageIndex + 1}"]`
    );
    if (target) {
      (target as HTMLElement).scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return {
    thumbnails,
    isPreviewVisible,
    togglePreview,
    handleThumbnailClick,
  };
}
