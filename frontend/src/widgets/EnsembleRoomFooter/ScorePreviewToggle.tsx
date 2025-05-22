// widgets/EnsembleRoomFooter/ScorePreviewToggle.tsx
import { useScoreStore } from "@/features/score/model/useScoreStore";

export function ScorePreviewToggle() {
  const isPreviewVisible = useScoreStore((state) => state.isPreviewVisible);
  const togglePreview = useScoreStore((state) => state.togglePreview);

  return (
    <button
      onClick={togglePreview}
      className="bg-gray-100 text-black px-3 py-1 rounded hover:bg-gray-200"
    >
      {isPreviewVisible ? "🔽 닫기" : "🎼 미리보기"}
    </button>
  );
}
