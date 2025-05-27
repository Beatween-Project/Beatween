import { useRef, useCallback, useEffect } from "react";
import { subscribeSheetStatus } from "../services/NotificationService";

export function useNotification(
  spaceId: number,
  {
    onProcess,
    onComplete,
    onError,
  }: {
    onProcess: (data: any) => void;
    onComplete: (data: any) => void;
    onError: (data: any) => void;
  }
): { start: () => void; stop: () => void } {
  const eventSourceRef = useRef<EventSource | null>(null);

  const stop = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
  }, []);

  const start = useCallback(() => {
    stop(); // 기존 연결 닫기

    const eventSource = subscribeSheetStatus(spaceId);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener("process", (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      onProcess(data);
    });

    eventSource.addEventListener("complete", (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      onComplete(data);
      stop(); // 완료 시 연결 종료 (필요 시 유지 가능)
    });

    eventSource.addEventListener("error", (event) => {
      console.error("SSE 오류:", event);
      onError(event);
      stop(); // 오류 시 연결 종료
    });
  }, [spaceId, onProcess, onComplete, onError, stop]);

  // 컴포넌트가 사라질 때 연결 닫기
  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { start, stop };
}
