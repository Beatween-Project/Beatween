import { useEffect, useRef, useState } from "react";
import { useSocketStore } from "@/app/store/socketStore";
import { useGlobalStore } from "@/app/store/globalStore";

/**
 * 매니저 여부를 확인하고 글로벌 스토어에 반영하는 커스텀 훅
 * - 개인 메시지 (/user/queue)
 * - 전체 브로드캐스트 (/topic)
 */
export function useManagerCheck(spaceId: string) {
  const stompClient = useSocketStore((s) => s.stompClient);
  const setIsManager = useGlobalStore((s) => s.setIsManager);
  const clientId = useGlobalStore((s) => s.clientId);

  const [pendingManager, setPendingManager] = useState<boolean | null>(null);
  const subscribedRef = useRef(false); // ✅ 중복 구독 방지

  useEffect(() => {
    if (!stompClient || !spaceId || subscribedRef.current) return;

    subscribedRef.current = true;

    // ✅ [1] 개인 응답 구독 (초기 접속 시 매니저 여부)
    const personalSub = stompClient.subscribe(
      `/user/queue/play/manager/${spaceId}`,
      (msg) => {
        const data = JSON.parse(msg.body); // { manager: true | false }
        console.log("📥 초기 매니저 여부 수신:", data);
        setPendingManager(!!data.manager);
      }
    );

    // ✅ [2] 매니저 변경 브로드캐스트 수신
    const broadcastSub = stompClient.subscribe(
      `/topic/play/manager/${spaceId}`,
      (msg) => {
        const data = JSON.parse(msg.body); // { userId: "456", ... }
        const isNewManager = String(data.userId) === String(clientId);
        console.log("🔁 매니저 변경 수신:", data, "→ 나인가?", isNewManager);
        setPendingManager(isNewManager);
      }
    );

    return () => {
      personalSub.unsubscribe();
      broadcastSub.unsubscribe();
      subscribedRef.current = false; // unmount 시 초기화
    };
  }, [stompClient, spaceId, clientId]);

  // ✅ 안전한 상태 반영 (렌더링 중 setState 방지)
  useEffect(() => {
    if (pendingManager !== null) {
      const timer = setTimeout(() => {
        setIsManager(pendingManager);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [pendingManager, setIsManager]);
}
