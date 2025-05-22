import { useEffect, useRef } from "react";
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
): () => void {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const eventSource = subscribeSheetStatus(spaceId);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener("connect", () => {
      // console.log("SSE 연결됨:", event);
    });

    eventSource.addEventListener("process", (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      onProcess(data);
    });

    eventSource.addEventListener("complete", (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      onComplete(data);
      eventSource.close();
    });

    eventSource.addEventListener("error", (event) => {
      console.error("SSE 오류:", event);
      onError(event);
      eventSource.close();
    });

    return () => {
      eventSource.close();
    };
  }, [spaceId]);

  return () => {
    eventSourceRef.current?.close();
  };
}
