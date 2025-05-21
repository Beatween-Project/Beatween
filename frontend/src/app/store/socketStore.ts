// src/app/store/socketStore.ts
import { create } from "zustand";
import { Client } from "@stomp/stompjs";

type SocketState = {
  stompClient: Client | null;
  spaceId: string | null;
  setStompClient: (client: Client | null) => void;
  setSpaceId: (spaceId: string | null) => void;
  disconnectWithCleanup: () => Promise<void>;
  updatePausedMeasure?: (measure: number) => void; // ✅ 이 줄 추가
  isConnected: boolean;
  setIsConnected: (value: boolean) => void;
};

export const useSocketStore = create<SocketState>((set, get) => ({
  stompClient: null,
  spaceId: null,

  setStompClient: (client) => {
    console.log("✅ [Zustand] stompClient 설정됨:", client);
    set({ stompClient: client });
  },

  setSpaceId: (spaceId) => {
    console.log("✅ [Zustand] spaceId 설정됨:", spaceId);
    set({ spaceId });
  },
  updatePausedMeasure: undefined, // 초기엔 undefined로 설정

  isConnected: false,
  setIsConnected: (value) => set({ isConnected: value }),

  disconnectWithCleanup: async () => {
    const { stompClient, spaceId } = get();

    console.log(
      "🚪 [Store] 연결 해제 시작 - spaceId:",
      spaceId,
      "connected:",
      stompClient?.connected
    );

    if (stompClient && stompClient.connected && spaceId) {
      try {
        console.log("📤 [Store] disconnect 메시지 전송 중...");

        // disconnect 메시지 전송
        stompClient.publish({
          destination: "/app/disconnect",
          headers: {
            spaceId,
          },
        });

        // 메시지 전송 완료를 위한 짧은 대기
        await new Promise((resolve) => setTimeout(resolve, 100));

        console.log("🔌 [Store] WebSocket 연결 해제 중...");
        await stompClient.deactivate();

        console.log("✅ [Store] WebSocket 정리 완료");
      } catch (error) {
        console.error("❌ [Store] WebSocket 해제 중 오류:", error);
      }
    } else {
      console.warn("⚠️ [Store] 연결된 WebSocket이 없거나 spaceId가 없음");
    }

    // 상태 초기화
    set({ stompClient: null, spaceId: null });
  },
}));
