import { useEffect, useRef } from "react";
import { useSocketStore } from "@/app/store/socketStore";
import { useScoreStore } from "@/features/score/model/useScoreStore";
import { useGlobalStore } from "@/app/store/globalStore";

export function usePlaySync(spaceId: string) {
  const stompClient = useSocketStore((state) => state.stompClient);
  const setCurrentMeasure = useScoreStore((state) => state.setCurrentMeasure);
  const setScorePlaying = useScoreStore((state) => state.setIsPlaying);
  const setGlobalPlaying = useGlobalStore((state) => state.setIsPlaying);
  const setBpm = useScoreStore((state) => state.setBpm);

  const currentMeasureRef = useRef<number>(0);
  const isPausedRef = useRef(false);
  const resumeTimestampRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number>(0);

  useEffect(() => {
    if (!stompClient || !spaceId) return;

    let subscription: any;

    const subscribeToPlay = () => {
      const topic = `/topic/play/session/${spaceId}`;
      const measureTopic = `/topic/play/measure/${spaceId}`;
      console.log("📡 [subscribe] 구독 시작:", topic, measureTopic);

      subscription = [
        stompClient.subscribe(topic, (msg) => {
          console.log("📥 [RECV] /topic/play/session 메시지 수신:", msg.body);
          const message = JSON.parse(msg.body);

          const { playStatus, startTimestamp, bpm, currentMeasure } = message;

          if (playStatus === "PLAYING") {
            console.log("▶️ [START] PLAYING 상태 진입");
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

            const tick = () => {
              const now = Date.now();
              const elapsed = now - resumeTimestampRef.current;
              const measure = Math.floor(elapsed / measureDuration);

              if (measure !== lastMeasure) {
                console.log(`🎯 [TICK] 마디 이동: ${lastMeasure} → ${measure}`);
                lastMeasure = measure;
                currentMeasureRef.current = measure;
                setCurrentMeasure(measure);
              }

              animationFrameIdRef.current = requestAnimationFrame(tick);
            };

            animationFrameIdRef.current = requestAnimationFrame(tick);
          } else {
            console.log("⏸️ [STOP] 정지 상태 진입:", playStatus);

            requestAnimationFrame(() => {
              setScorePlaying(false);
              setGlobalPlaying(false);
            });

            isPausedRef.current = true;
            cancelAnimationFrame(animationFrameIdRef.current);

            if (currentMeasure !== undefined) {
              console.log(`📍 [SET] 정지 시점 마디: ${currentMeasure}`);
              currentMeasureRef.current = currentMeasure;
              setCurrentMeasure(currentMeasure);
            }
          }
        }),

        stompClient.subscribe(measureTopic, (msg) => {
          const message = JSON.parse(msg.body);
          console.log("📥 [RECV] /topic/play/measure 메시지 수신:", message);
          if (message.currentMeasure !== undefined) {
            currentMeasureRef.current = message.currentMeasure;
            setCurrentMeasure(message.currentMeasure);
          }
        }),
      ];
    };

    if (stompClient.connected) {
      console.log("🔌 stompClient 연결됨, 구독 시작");
      subscribeToPlay();
    } else {
      console.log("🕓 stompClient 비연결 상태 → 연결 후 구독 예정");
      stompClient.onConnect = () => {
        console.log("🔌 stompClient 연결 완료 → 구독 시작");
        subscribeToPlay();
      };
      stompClient.activate();
    }

    return () => {
      if (subscription) {
        subscription.forEach((sub: any) => sub.unsubscribe());
      }
      cancelAnimationFrame(animationFrameIdRef.current);
      console.log("🧹 cleanup: 구독 해제, 애니메이션 취소");
    };
  }, [stompClient, spaceId]);
}
