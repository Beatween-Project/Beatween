import { usePlayerStore } from "@/features/player/model/usePlayerStore";
import { Icon } from "@/shared/ui/Icon";
import { useScoreStore } from "@/features/score/model/useScoreStore";
import { useGlobalStore } from "@/app/store/globalStore";
import { useSocketStore } from "@/app/store/socketStore";

export function PlayControl() {
  const { isPlaying, togglePlay, currentMeasure } = usePlayerStore();
  const { measureCount, bpm } = useScoreStore();
  const setGlobalPlaying = useGlobalStore((state) => state.setIsPlaying);
  const stompClient = useSocketStore((state) => state.stompClient);

  const publishPlayState = (
    status: "PLAYING" | "PAUSED" | "STOPPED",
    measure: number
  ) => {
    const message = {
      spaceId: 11,
      bpm,
      startTimestamp: Date.now(),
      playStatus: status,
      currentMeasure: measure,
      positionInMeasure: 0,
    };

    console.log("🛰️ [SEND] /app/play/update payload:", message);

    if (stompClient?.connected) {
      stompClient.publish({
        destination: "/app/play/update",
        body: JSON.stringify(message),
      });
      console.log("✅ [WebSocket] 메시지 전송 성공");
    } else {
      console.warn("❌ [WebSocket] 연결 안 됨 - stompClient.connected=false");
    }
  };

  const handlePlayToggle = () => {
    const isCurrentlyPlaying = usePlayerStore.getState().isPlaying;
    console.log(
      `🎬 [CLICK] PlayToggle - 현재 상태: ${
        isCurrentlyPlaying ? "재생 중" : "정지 상태"
      }`
    );

    togglePlay();
    setGlobalPlaying(!isCurrentlyPlaying);

    const status = isCurrentlyPlaying ? "PAUSED" : "PLAYING";
    publishPlayState(status, currentMeasure);
  };

  const handleStop = () => {
    console.log("⏹️ [CLICK] Stop");

    useScoreStore.getState().setIsPlaying(false);
    useScoreStore.getState().setCurrentMeasure(0);
    setGlobalPlaying(false);

    publishPlayState("STOPPED", 0);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handlePlayToggle}
        className="rounded-md bg-white/10 hover:bg-white/20 p-2"
      >
        <Icon icon={isPlaying ? "pause" : "play_arrow"} size={24} />
      </button>
      <button
        onClick={handleStop}
        className="rounded-md bg-white/10 hover:bg-white/20 p-2"
      >
        <Icon icon="stop" size={24} />
      </button>
      <span className="text-sm font-medium">
        {currentMeasure + 1}마디 / {measureCount + 1}마디
      </span>
    </div>
  );
}
