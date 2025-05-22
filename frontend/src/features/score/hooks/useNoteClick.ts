// features/score/hooks/useNoteClick.ts
import { useEffect } from "react";
import { useScoreStore } from "@/features/score/model/useScoreStore";

export function useNoteClick(
  containerRef: React.RefObject<HTMLDivElement>,
  toolkitRef: React.MutableRefObject<any>
) {
  const setSelectedNote = useScoreStore((state) => state.setSelectedNote);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as SVGElement;
      const group = target.closest(
        "g.note, g.rest, g.mRest"
      ) as SVGGElement | null;
      const toolkit = toolkitRef.current;
      if (!group || !group.id || !toolkit) return;

      const xmlId = group.id;
      try {
        const raw = toolkit.getElementAttr(xmlId);
        const info = typeof raw === "string" ? JSON.parse(raw) : raw;

        if (info?.rest) {
          setSelectedNote("😴 쉼표입니다.");
          return;
        }

        const step = info?.pname?.toUpperCase();
        const octave = info?.oct;
        const koreanNoteMap: Record<string, string> = {
          C: "도",
          D: "레",
          E: "미",
          F: "파",
          G: "솔",
          A: "라",
          B: "시",
        };

        if (step) {
          const noteName = koreanNoteMap[step] || step;
          setSelectedNote(
            `${noteName}${octave !== undefined ? ` (${octave}옥타브)` : ""}`
          );
        } else {
          setSelectedNote("⚠️ 음정 정보 없음");
        }
      } catch (err) {
        console.error("⚠️ getElementAttr 실패:", err);
        setSelectedNote("⚠️ 음표 정보 파싱 실패");
      }
    };

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, [containerRef, toolkitRef, setSelectedNote]);
}
