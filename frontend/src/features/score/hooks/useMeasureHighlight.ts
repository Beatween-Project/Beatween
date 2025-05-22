import { useEffect, useRef } from "react";
import { useScoreStore } from "@/features/score/model/useScoreStore";

export function useMeasureHighlight(
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  const { currentMeasure, isPlaying } = useScoreStore();

  const didInitialRenderRef = useRef(false);

  const updateHighlight = () => {
    const container = containerRef.current;
    if (!container) return;

    const measures = container.querySelectorAll("g.measure");

    measures.forEach((m, i) => {
      const old = m.querySelector("rect.measure-highlight");
      if (old) m.removeChild(old);

      if (i === currentMeasure) {
        const bbox = (m as SVGGElement).getBBox();
        const rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        rect.setAttribute("x", `${bbox.x}`);
        rect.setAttribute("y", `${bbox.y}`);
        rect.setAttribute("width", `${bbox.width}`);
        rect.setAttribute("height", `${bbox.height}`);
        rect.setAttribute("fill", "rgba(144, 238, 144, 0.3)");
        rect.setAttribute("stroke", "rgba(34, 139, 34, 0.6)");
        rect.setAttribute("stroke-width", "1");
        rect.setAttribute("class", "measure-highlight");
        rect.setAttribute("pointer-events", "none");
        m.insertBefore(rect, m.firstChild);
      }
    });
  };

  // ✅ 마디가 변경될 때마다 하이라이팅
  useEffect(() => {
    requestAnimationFrame(() => {
      updateHighlight();
    });
  }, [currentMeasure]);

  // ✅ 재생 시작 시 첫 마디 강제 하이라이팅 (currentMeasure 변경 없어도)
  useEffect(() => {
    if (isPlaying && !didInitialRenderRef.current) {
      requestAnimationFrame(() => {
        updateHighlight();
        didInitialRenderRef.current = true;
      });
    }

    // 재생이 끝나거나 멈췄을 때 초기화
    if (!isPlaying) {
      didInitialRenderRef.current = false;
    }
  }, [isPlaying]);
}
