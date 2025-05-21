import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReplicateSongParams } from "../types/replicateSong.types";
import { replicateSongService } from "../service/replicateSongService";
import { toast } from "@/shared/lib/toast";

export const useReplicateSong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ spaceId, songId, data }: ReplicateSongParams) =>
      replicateSongService(spaceId, songId, data),

    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: ["copySong", variables.spaceId],
        });
        toast.success({
          title: "복제 성공",
          message: "곡이 성공적으로 복제되었습니다.",
        });
      } else {
        toast.error({
          title: "복제 실패",
          message: "곡 복제 중 문제가 발생했습니다.",
        });
      }
    },

    onError: () => {
      toast.error({
        title: "복제 실패",
        message: "곡 복제 중 오류가 발생했습니다. 다시 시도해주세요.",
      });
    },
  });
};
