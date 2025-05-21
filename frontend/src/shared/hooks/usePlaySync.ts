import { useEffect, useRef } from "react";
import { useSocketStore } from "@/app/store/socketStore";
import { useScoreStore } from "@/features/score/model/useScoreStore";
import { useGlobalStore } from "@/app/store/globalStore";

export function usePlaySync(spaceId: string) {
  const stompClient = useSocketStore((state) => state.stompClient);
  const clientId = useGlobalStore((state) => state.clientId);

  const setCurrentMeasure = useScoreStore((state) => state.setCurrentMeasure);
  const setScorePlaying = useScoreStore((state) => state.setIsPlaying);
  const setGlobalPlaying = useGlobalStore((state) => state.setIsPlaying);
  const setBpm = useScoreStore((state) => state.setBpm);

  const currentMeasureRef = useRef<number>(0);
  const isPausedRef = useRef(false);
  const pauseMeasureRef = useRef<number>(0);
  const resumeTimestampRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number>(0);

  const updatePausedMeasure = (measure: number) => {
    if (!stompClient || !spaceId) return;

    pauseMeasureRef.current = measure;
    currentMeasureRef.current = measure;
    setCurrentMeasure(measure);

    if (isPausedRef.current) {
      const message = {
        sender: clientId,
        spaceId,
        currentMeasure: measure,
      };

      stompClient.publish({
        destination: `/app/play/update`,
        body: JSON.stringify(message),
      });

      window.dispatchEvent(
        new CustomEvent("measure-update", { detail: message })
      );
    }
  };

  useSocketStore.setState({ updatePausedMeasure });

  useEffect(() => {
    if (!stompClient || !spaceId) return;

    let subscription: any;

    const subscribeToPlay = () => {
      const topic = `/topic/play/session/${spaceId}`;
      const measureTopic = `/topic/play/measure/${spaceId}`;

      subscription = [
        stompClient.subscribe(topic, (msg) => {
          const message = JSON.parse(msg.body);
          if (message.sender === clientId) return;

          const { playStatus, startTimestamp, bpm, currentMeasure } = message;

          if (playStatus === "PLAYING") {
            requestAnimationFrame(() => {
              setScorePlaying(true);
              setGlobalPlaying(true);
              setBpm(Number(bpm));
            });

            const beatDuration = 60000 / bpm;
            const measureDuration = beatDuration * 4;

            isPausedRef.current = false;
            resumeTimestampRef.current = startTimestamp ?? Date.now();

            let lastMeasure = -1;
            const measureTimestamps: Record<number, number> = {};

            const tick = () => {
              const now = Date.now();
              const elapsed = now - resumeTimestampRef.current;
              const measure = Math.floor(elapsed / measureDuration);

              if (measure !== lastMeasure) {
                const timeNow = performance.now();
                measureTimestamps[measure] = timeNow;
                if (measure > 0 && measureTimestamps[measure - 1]) {
                  const prevTime = measureTimestamps[measure - 1];
                  const duration = (timeNow - prevTime).toFixed(2);
                  console.log(
                    `[⏱] Measure ${measure - 1} → ${measure}: ${duration}ms`
                  );
                } else {
                  console.log(`[⏱] Measure ${measure} started`);
                }

                console.log(`[🎯] Current measure set to: ${measure}`);
                lastMeasure = measure;
                currentMeasureRef.current = measure;
                setCurrentMeasure(measure);
              }

              animationFrameIdRef.current = requestAnimationFrame(tick);
            };

            animationFrameIdRef.current = requestAnimationFrame(tick);
          } else {
            requestAnimationFrame(() => {
              setScorePlaying(false);
              setGlobalPlaying(false);
            });

            isPausedRef.current = true;
            cancelAnimationFrame(animationFrameIdRef.current);

            if (currentMeasure !== undefined) {
              currentMeasureRef.current = currentMeasure;
              pauseMeasureRef.current = currentMeasure;
              setCurrentMeasure(currentMeasure);
            }
          }
        }),

        stompClient.subscribe(measureTopic, (msg) => {
          const message = JSON.parse(msg.body);
          if (message.sender === clientId) return;

          if (message.currentMeasure !== undefined) {
            currentMeasureRef.current = message.currentMeasure;
            pauseMeasureRef.current = message.currentMeasure;
            setCurrentMeasure(message.currentMeasure);
          }
        }),
      ];
    };

    if (stompClient.connected) {
      subscribeToPlay();
    } else {
      stompClient.onConnect = () => {
        subscribeToPlay();
      };
      stompClient.activate();
    }

    const handleMeasureUpdate = (e: any) => {
      const message = e.detail;
      if (message.sender === clientId) return;
      if (message.currentMeasure !== undefined) {
        currentMeasureRef.current = message.currentMeasure;
        pauseMeasureRef.current = message.currentMeasure;
        setCurrentMeasure(message.currentMeasure);
      }
    };

    window.addEventListener("measure-update", handleMeasureUpdate);

    return () => {
      if (subscription) {
        subscription.forEach((sub: any) => sub.unsubscribe());
      }
      cancelAnimationFrame(animationFrameIdRef.current);
      window.removeEventListener("measure-update", handleMeasureUpdate);
    };
  }, [stompClient, spaceId, clientId]);
}
