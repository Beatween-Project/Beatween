import { useEffect, useRef } from "react";
import { useSocketStore } from "@/app/store/socketStore";
import { useScoreStore } from "@/features/score/model/useScoreStore";

export function PlaySyncSubscriber() {
  const stompClient = useSocketStore((state) => state.stompClient);
  const spaceId = useSocketStore((state) => state.spaceId);

  const setCurrentMeasure = useScoreStore((state) => state.setCurrentMeasure);
  const setIsPlaying = useScoreStore((state) => state.setIsPlaying);
  const setBpm = useScoreStore((state) => state.setBpm);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!stompClient?.connected || !spaceId) return;

    const sub = stompClient.subscribe(
      `/topic/play/session/${spaceId}`,
      (msg) => {
        const message = JSON.parse(msg.body);
        const { playStatus, startTimestamp, bpm } = message;

        if (playStatus === "PLAYING") {
          setIsPlaying(true);
          setBpm(Number(bpm));

          if (intervalRef.current) clearInterval(intervalRef.current);

          const beatDuration = 60000 / bpm;
          const measureDuration = beatDuration * 4;

          intervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimestamp;
            const measure = Math.floor(elapsed / measureDuration);
            setCurrentMeasure(measure);
          }, 100);
        } else {
          setIsPlaying(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          if (message.currentMeasure !== undefined) {
            setCurrentMeasure(message.currentMeasure);
          }
        }
      }
    );

    return () => {
      sub.unsubscribe();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [stompClient, spaceId]);

  return null;
}
