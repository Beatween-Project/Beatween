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

  useEffect(() => {
    requestAnimationFrame(() => {
      updateHighlight();
    });
  }, [currentMeasure]);

  useEffect(() => {
    if (isPlaying && !didInitialRenderRef.current) {
      requestAnimationFrame(() => {
        updateHighlight();
        didInitialRenderRef.current = true;
      });
    }
    if (!isPlaying) {
      didInitialRenderRef.current = false;
    }
  }, [isPlaying]);

  // ✅ 클릭 이벤트 등록 – 재생 중이면 건너뜀
  useEffect(() => {
    const container = containerRef.current;
    if (!container || isPlaying) return;

    const observer = new MutationObserver(() => {
      const measures = container.querySelectorAll("g.measure");
      if (measures.length === 0) return;

      measures.forEach((el, idx) => {
        const g = el as SVGGElement;
        if (g.getAttribute("data-click-bound") === "true") return;

        g.style.cursor = "pointer";
        g.style.pointerEvents = "auto";
        g.addEventListener("click", () => {
          useScoreStore.getState().setCurrentMeasure(idx);
          console.log("🎯 마디 클릭 → currentMeasure 변경:", idx);
        });
        g.setAttribute("data-click-bound", "true");
      });
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [containerRef, isPlaying]);
}
