import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeSong } from "../services/deleteCopySongService";
import { DeleteSongParams } from "../types/deleteCopySong.types";
import { toast } from "@/shared/lib/toast";

export const useDeleteCopySong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeleteSongParams) => removeSong(params),
    onSuccess: (_, { spaceId }) => {
      queryClient.invalidateQueries({ queryKey: ["copySong", spaceId] });
      toast.success({
        title: "삭제 성공",
        message: "곡이 성공적으로 삭제되었습니다.",
      });
    },
    onError: () => {
      toast.error({
        title: "삭제 실패",
        message: "곡이 제대로 삭제되지 않았습니다. 다시 시도해주세요.",
      });
    },
  });
};
