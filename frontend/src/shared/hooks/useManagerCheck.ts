import { useEffect, useRef, useState } from "react";
import { useSocketStore } from "@/app/store/socketStore";
import { useGlobalStore } from "@/app/store/globalStore";

/**
 * 매니저 여부를 확인하고 글로벌 스토어에 반영하는 커스텀 훅
 */
export function useManagerCheck(spaceId: string) {
  const stompClient = useSocketStore((s) => s.stompClient);
  const setIsManager = useGlobalStore((s) => s.setIsManager);

  const [pendingManager, setPendingManager] = useState<boolean | null>(null);
  const subscribedRef = useRef(false);

  console.log("📡 stompClient.connected (init):", stompClient?.connected);

  useEffect(() => {
    if (!stompClient || !spaceId || subscribedRef.current) {
      console.log("⚠️ 조건 미충족 - 구독 생략", {
        stompClientExists: !!stompClient,
        spaceIdExists: !!spaceId,
        alreadySubscribed: subscribedRef.current,
      });
      return;
    }

    subscribedRef.current = true;
    console.log("🛰️ 매니저 상태 구독 시작:", spaceId);

    const managerSub = stompClient.subscribe(
      `/user/queue/play/manager/${spaceId}`,
      (msg) => {
        try {
          const data = JSON.parse(msg.body);
          console.log("🧪 매니저 여부 메시지 수신:", data);
          console.log("📥 수신된 메시지 구조:", JSON.stringify(data));

          const managerStatus =
            typeof data === "boolean"
              ? data
              : data?.manager ?? data?.isManager ?? null;

          if (typeof managerStatus === "boolean") {
            console.log("✅ 최종적으로 setIsManager 호출됨:", managerStatus);
            setPendingManager(managerStatus);
          } else {
            console.warn("⚠️ 알 수 없는 메시지 구조:", data);
          }
        } catch (e) {
          console.error("❌ 메시지 파싱 실패:", msg.body, e);
        }
      }
    );

    return () => {
      managerSub.unsubscribe();
      subscribedRef.current = false;
      console.log("🧹 매니저 구독 해제:", spaceId);
    };
  }, [stompClient, spaceId]);

  useEffect(() => {
    if (pendingManager !== null) {
      console.log("🕓 pendingManager useEffect triggered:", pendingManager);
      const timer = setTimeout(() => {
        setIsManager(pendingManager);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [pendingManager, setIsManager]);
}