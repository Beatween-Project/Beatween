import { useEffect, useRef } from "react";
import { VerovioToolkit } from "verovio/esm";
import createVerovioModule from "verovio/wasm";
import { useScoreStore } from "@/features/score/model/useScoreStore";

export function useVerovioLoader(
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | null = null;

    async function init() {
      try {
        const VerovioModule = await createVerovioModule({
          locateFile: (path: string) =>
            path.endsWith(".wasm") ? "/verovio/verovio.wasm" : path,
        });

        const toolkit = new VerovioToolkit(VerovioModule);
        toolkit.setOptions({
          scale: 13,
          pageWidth: 2000,
          adjustPageHeight: true,
          spacingLinear: 0.5,
          spacingSystem: 18,
          spacingStaff: 6.5,
          spacingNonLinear: 0,
          breaks: "encoded",
          svgViewBox: true,
          footer: "none",
          header: "none",
        });

        const response = await fetch(
          "https://a205-beatween-bucket.s3.ap-northeast-2.amazonaws.com/sheets/vocal_drum.musicxml"
        );
        const xml = await response.text();

        const store = useScoreStore.getState();
        store.setXmlData(xml);
        toolkit.loadData(xml);

        const pageCount = toolkit.getPageCount();
        let svgAllPages = "";
        const thumbs: string[] = [];

        for (let i = 1; i <= pageCount; i++) {
          const svg = toolkit.renderToSVG(i);
          thumbs.push(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`);
          svgAllPages += `<div class="page-wrapper py-16 scroll-mt-10" data-page="${i}" style="padding-top: 64px;">${svg}</div>`;
        }

        store.setThumbnails(thumbs);

        const container = containerRef.current;
        const verovioTarget = container?.querySelector("#verovio-container");

        if (verovioTarget) {
          verovioTarget.innerHTML = svgAllPages;

          const systemElements = verovioTarget.querySelectorAll("g.system");

          systemElements.forEach((systemEl) => {
            // Tailwind scroll margin top 클래스 추가
            (systemEl as HTMLElement).classList.add("scroll-mt-[64px]");
          });
          let totalHeight = 0;
          const systemList: { el: Element; measureIds: number[] }[] = [];
          let globalMeasureIndex = 0;

          systemElements.forEach((systemEl) => {
            const measures = Array.from(systemEl.querySelectorAll("g.measure"));
            const measureIds = measures.map(() => globalMeasureIndex++);

            measures.forEach((el, i) => {
              const measureIndex = measureIds[i];
              el.setAttribute("data-measure-index", String(measureIndex));
              (el as SVGGraphicsElement).style.cursor = "pointer";
              el.addEventListener("click", () => {
                const { isPlaying } = useScoreStore.getState();
                if (isPlaying) return;
                useScoreStore.getState().setCurrentMeasure(measureIndex);
              });
            });

            const bbox = (systemEl as SVGGElement).getBBox();
            totalHeight += bbox.height;

            systemList.push({
              el: systemEl,
              measureIds,
            });
          });
          const measureElements = verovioTarget.querySelectorAll("g.measure");
          store.setMeasureCount(measureElements.length);
          store.setSystems(systemList);
        } else {
          console.warn("❗ #verovio-container not found in containerRef");
        }

        cleanup = () => {
          if (verovioTarget) verovioTarget.innerHTML = "";
        };

        try {
          const timeMap = toolkit.renderToMIDI();
          const bpmMatch = timeMap?.match(/Tempo="?(\d+)"?/i);
          if (bpmMatch) {
            const parsedBpm = parseInt(bpmMatch[1], 10);
            if (!isNaN(parsedBpm)) {
              store.setBpm(parsedBpm);
            }
          }
        } catch (err) {
          console.warn("BPM 추출 실패:", err);
        }
      } catch (e) {
        console.error("🔥 Verovio 로드 실패:", e);
      }
    }

    init();

    return () => {
      if (typeof cleanup === "function") cleanup();
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [containerRef]);
}
