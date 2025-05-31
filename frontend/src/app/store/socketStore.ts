import { create } from "zustand";
import { Client } from "@stomp/stompjs";
import { useScoreStore } from "@/features/score/model/useScoreStore"; // ✅ 추가

type SocketState = {
  stompClient: Client | null;
  spaceId: string | null;
  setStompClient: (client: Client | null) => void;
  setSpaceId: (spaceId: string | null) => void;
  disconnectWithCleanup: () => Promise<void>;
  updatePausedMeasure?: (measure: number) => void;
  isConnected: boolean;
  setIsConnected: (value: boolean) => void;
};

export const useSocketStore = create<SocketState>((set, get) => ({
  stompClient: null,
  spaceId: null,

  setStompClient: (client) => set({ stompClient: client }),
  setSpaceId: (spaceId) => set({ spaceId }),
  updatePausedMeasure: undefined,
  isConnected: false,
  setIsConnected: (value) => set({ isConnected: value }),

  disconnectWithCleanup: async () => {
    const { stompClient } = get();

    if (stompClient && stompClient.connected) {
      try {
        stompClient.publish({
          destination: "/app/disconnect",
          body: "",
        });

        await new Promise((resolve) => setTimeout(resolve, 200));
        await stompClient.deactivate();

        console.log("✅ [Store] WebSocket 정상 종료됨");
      } catch (error) {
        console.error("❌ [Store] WebSocket 종료 중 오류:", error);
      }
    } else {
      console.warn("⚠️ [Store] 종료 시도: 연결된 stompClient가 없음");
    }

    // ✅ ScoreStore 상태 초기화
    useScoreStore.getState().reset();

    set({ stompClient: null, spaceId: null, isConnected: false });
  },
}));
