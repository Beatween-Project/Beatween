import { useCreateSheet } from "./useCreateSheet";
import { UrlRequestDto } from "../types/createSheet.types";
import { useNotification } from "@/features/notification/hooks/useNotification";
import { useSheetStore } from "../store/useSheetStore";
import { toast } from "@/shared/lib/toast";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useCreateSheetWithNotification(spaceId: number) {
  const queryClient = useQueryClient();

  const { mutate: createSheet } = useCreateSheet({ spaceId });

  const setCreating = useSheetStore((state) => state.setCreating);

  const { start: startNotification, stop: stopNotification } = useNotification(
    spaceId,
    {
      onProcess: () => {
        toast.success({
          title: "악보 생성 시작",
          message: "악보가 생성 중입니다.",
        });
      },
      onComplete: () => {
        setCreating(false);
        toast.success({
          title: "악보 생성 완료",
          message: "성공적으로 악보가 생성되었습니다.",
        });
        queryClient.invalidateQueries({ queryKey: ["copySong", spaceId] });
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        stopNotification(); // 완료되면 SSE 연결 끊기
      },
      onError: () => {
        setCreating(false);
        toast.error({
          title: "악보 생성 실패",
          message: "서버가 악보를 생성하지 못했습니다. 다시 시도해주세요.",
        });
        stopNotification(); // 완료되면 SSE 연결 끊기
      },
    }
  );

  const startCreateSheet = (youtubeUrl: string) => {
    startNotification();
    createSheet({ youtube_url: youtubeUrl } as UrlRequestDto);
  };

  useEffect(() => {
    return () => {
      stopNotification();
    };
  }, [stopNotification]);

  return { startCreateSheet };
}
