import { useCreateSheet } from "./useCreateSheet";
import { UrlRequestDto } from "../types/createSheet.types";
import { useRef } from "react";
import { useNotification } from "@/features/notification/hooks/useNotification";
import { useSheetStore } from "../store/useSheetStore";
import { toast } from "@/shared/lib/toast";
import { useNotificationStore } from "@/features/notification/store/useNotificationStore";
import { useQueryClient } from "@tanstack/react-query";

export function useCreateSheetWithNotification(spaceId: number) {
  const queryClient = useQueryClient();

  const { mutate: createSheet } = useCreateSheet({ spaceId });

  const unsubscribeRef = useRef<(() => void) | null>(null);

  const setCreating = useSheetStore((state) => state.setCreating);

  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );

  unsubscribeRef.current = useNotification(spaceId, {
    onProcess: (data) => {
      setCreating(true);
      addNotification({
        id: crypto.randomUUID(),
        type: "process",
        message: `🎵 악보 생성 중: ${data?.title ?? "제목 없음"}`,
        timestamp: Date.now(),
      });
      toast.success({
        title: "악보 생성 시작",
        message: "악보가 생성 중입니다.",
      });
    },
    onComplete: (data) => {
      setCreating(false);
      addNotification({
        id: crypto.randomUUID(),
        type: "complete",
        message: `생성 완료: ${data?.title ?? "제목 없음"}`,
        timestamp: Date.now(),
      });
      toast.success({
        title: "악보 생성 완료",
        message: "성공적으로 악보가 생성되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["copySong", spaceId] });
      // unsubscribeRef.current?.(); //구독 끊지 않고 계속 알림 오게 주석 처리, 혹시 몰라 남겨둠
    },
    onError: (error) => {
      setCreating(false);
      addNotification({
        id: crypto.randomUUID(),
        type: "error",
        message: `❌ 생성 실패: ${error?.message ?? "알 수 없는 오류"}`,
        timestamp: Date.now(),
      });
      toast.error({
        title: "악보 생성 실패",
        message: "서버가 악보를 생성하지 못했습니다. 다시 시도해주세요.",
      });
      // console.error("🔴 생성 실패:", error);
      // unsubscribeRef.current?.(); //구독 끊지 않고 계속 알림 오게 주석 처리, 혹시 몰라 남겨둠
    },
  });

  const startCreateSheet = (youtubeUrl: string) => {
    createSheet({ youtube_url: youtubeUrl } as UrlRequestDto);
  };

  return { startCreateSheet };
}
