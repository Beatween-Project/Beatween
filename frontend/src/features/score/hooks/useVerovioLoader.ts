import { useEffect, useRef } from "react";
import { VerovioToolkit } from "verovio/esm";
import createVerovioModule from "verovio/wasm";
// import { useScoreStore } from "@/features/score/model/useScoreStore";

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

        // 악보 기본 로딩 제거됨
        // const store = useScoreStore.getState();
        const container = containerRef.current;
        const verovioTarget = container?.querySelector("#verovio-container");

        cleanup = () => {
          if (verovioTarget) verovioTarget.innerHTML = "";
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
  }, [containerRef]);
}
