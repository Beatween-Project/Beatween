import { useEffect, useRef, useState } from "react";
import { VerovioToolkit } from "verovio/esm";
import createVerovioModule from "verovio/wasm";
import { useInstrumentStore } from "@/features/instrument/model/useInstrumentStore";
import { useScoreStore } from "@/features/score/model/useScoreStore";

const xmlCache: Record<string, string> = {};

export function useVerovioLoader(
  containerRef: React.RefObject<HTMLDivElement | null>,
  onLoaded?: () => void
) {
  const [isLoading, setIsLoading] = useState(false);

  const playTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sheetUrl = useInstrumentStore((state) => state.selectedSheetUrl);
  const sheets = useScoreStore((state) => state.selectedSheets);
  const selectedPart = useInstrumentStore((state) => state.selected);
  const setSelectedSheetUrl = useInstrumentStore(
    (state) => state.setSelectedSheetUrl
  );
  const setSystems = useScoreStore((state) => state.setSystems);
  const setMeasureCount = useScoreStore((state) => state.setMeasureCount);

  // 1. 악기 선택 → 해당 시트 URL 세팅
useEffect(() => {
 if (!selectedPart || sheets.length === 0) {
    setSelectedSheetUrl(""); // ⚠️ 꼭 초기화
    return;
  }
  const match = sheets.find((s) => s.part === selectedPart);
  if (match) {
    setSelectedSheetUrl(match.sheetUrl);
  } else {
    setSelectedSheetUrl("");
  }
}, [selectedPart, sheets, setSelectedSheetUrl]);

  // 2. URL이 바뀌면 Verovio 렌더링
  useEffect(() => {
    let cleanup: (() => void) | null = null;

    async function init() {
      console.log("🎯 useVerovioLoader 실행됨, sheetUrl:", sheetUrl);

      if (!sheetUrl) {
        console.warn("🚫 선택된 sheetUrl 없음 - 렌더링 스킵");
        return;
      }

      const container = containerRef.current;
      if (!container) return;

      const verovioTarget = container.querySelector("#verovio-container");
      if (!verovioTarget) return;

      verovioTarget.innerHTML = "";

      try {
        setIsLoading(true);

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

        let xml: string;
        if (xmlCache[sheetUrl]) {
          xml = xmlCache[sheetUrl];
        } else {
          const response = await fetch(sheetUrl);
          xml = await response.text();
          xmlCache[sheetUrl] = xml;
        }

        toolkit.loadData(xml);
        const pageCount = toolkit.getPageCount();
        for (let i = 1; i <= pageCount; i++) {
          const svg = toolkit.renderToSVG(i, {});
          const wrapper = document.createElement("div");
          wrapper.innerHTML = svg;
          verovioTarget.appendChild(wrapper);
        }

        // 시스템, 마디 정보 수집
        const systemElements = verovioTarget.querySelectorAll("g.system");
        const systemList: { el: Element; measureIds: number[] }[] = [];
        let globalMeasureIndex = 0;

        systemElements.forEach((systemEl) => {
          const measures = Array.from(systemEl.querySelectorAll("g.measure"));
          const measureIds = measures.map(() => globalMeasureIndex++);

          measures.forEach((el, i) => {
            el.setAttribute("data-measure-index", String(measureIds[i]));
          });

          systemList.push({
            el: systemEl,
            measureIds,
          });
        });

        setSystems(systemList);
        setMeasureCount(globalMeasureIndex);

        cleanup = () => {
          verovioTarget.innerHTML = "";
        };
      } catch (e) {}
    }

    init();

    return () => {
      if (typeof cleanup === "function") cleanup();
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [containerRef, sheetUrl, setSystems, setMeasureCount]);

  return { isLoading };
}
