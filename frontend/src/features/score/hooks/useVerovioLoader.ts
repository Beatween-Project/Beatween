import { useEffect, useRef } from "react";
import { VerovioToolkit } from "verovio/esm";
import createVerovioModule from "verovio/wasm";
import { useInstrumentStore } from "@/features/instrument/model/useInstrumentStore";
import { useScoreStore } from "@/features/score/model/useScoreStore";

const xmlCache: Record<string, string> = {};

export function useVerovioLoader(
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sheetUrl = useInstrumentStore((state) => state.selectedSheetUrl);
  const sheets = useScoreStore((state) => state.selectedSheets);
  const selectedPart = useInstrumentStore((state) => state.selected);
  const setSelectedSheetUrl = useInstrumentStore(
    (state) => state.setSelectedSheetUrl
  );
  const setSystems = useScoreStore((state) => state.setSystems);
  const setMeasureCount = useScoreStore((state) => state.setMeasureCount);

  // 매번 selected에 맞는 sheetUrl을 설정
  useEffect(() => {
    const match = sheets.find((s) => s.part === selectedPart);
    if (match) {
      setSelectedSheetUrl(match.sheetUrl);
    } else {
      setSelectedSheetUrl(""); // null 대신 빈 문자열로 설정해 타입 오류 방지
    }
  }, [selectedPart, sheets, setSelectedSheetUrl]);

  useEffect(() => {
    let cleanup: (() => void) | null = null;

    async function init() {
      console.log("🎯 useVerovioLoader 실행됨, sheetUrl:", sheetUrl);

      if (!sheetUrl) {
        console.warn("⛔ sheetUrl 없음, 렌더링 스킵");
        return;
      }

      const container = containerRef.current;
      if (!container) return;

      const verovioTarget = container.querySelector("#verovio-container");
      if (!verovioTarget) return;

      verovioTarget.innerHTML = ""; // URL이 바뀔 때마다 초기화

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

        let xml: string;
        if (xmlCache[sheetUrl]) {
          console.log("📦 XML 캐시 사용:", sheetUrl);
          xml = xmlCache[sheetUrl];
        } else {
          console.log("🌐 XML 네트워크 요청:", sheetUrl);
          const response = await fetch(sheetUrl);
          xml = await response.text();
          xmlCache[sheetUrl] = xml;
        }

        console.log("🧾 현재 캐시 상태:", xmlCache);

        toolkit.loadData(xml);

        const pageCount = toolkit.getPageCount();
        for (let i = 1; i <= pageCount; i++) {
          const svg = toolkit.renderToSVG(i, {});
          const wrapper = document.createElement("div");
          wrapper.innerHTML = svg;
          verovioTarget.appendChild(wrapper);
        }

        // ✅ 시스템과 마디 정보 수집
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
      } catch (e) {
        console.error("🔥 Verovio 로드 실패:", e);
      }
    }

    init();

    return () => {
      if (typeof cleanup === "function") cleanup();
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [containerRef, sheetUrl, setSystems, setMeasureCount]);
}
