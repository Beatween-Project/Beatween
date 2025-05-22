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
    set({ stompClient: client });
  },

  setSpaceId: (spaceId) => {
    set({ spaceId });
  },
  updatePausedMeasure: undefined, // 초기엔 undefined로 설정

  isConnected: false,
  setIsConnected: (value) => set({ isConnected: value }),

  disconnectWithCleanup: async () => {
    const { stompClient, spaceId } = get();

    if (stompClient && stompClient.connected && spaceId) {
      try {
        // disconnect 메시지 전송
        stompClient.publish({
          destination: "/app/disconnect",
          headers: {
            spaceId,
          },
        });

        // 메시지 전송 완료를 위한 짧은 대기
        await new Promise((resolve) => setTimeout(resolve, 100));

        await stompClient.deactivate();
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
