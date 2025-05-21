import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DeleteTeamSpaceParams } from "../types/deleteExitBand.types";
import { removeTeamSpace } from "../services/deleteExitBandService";
import { toast } from "@/shared/lib/toast";

export const useDeleteTeamSpace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeleteTeamSpaceParams) => removeTeamSpace(params),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["spaces"] });
        toast.success({
          title: "삭제 성공",
          message: "팀 스페이스가 성공적으로 삭제되었습니다.",
        });
      } else {
        toast.error({
          title: "삭제 실패",
          message: data.error?.message ?? "알 수 없는 오류가 발생했습니다.",
        });
      }
    },
    onError: () => {
      toast.error({
        title: "삭제 실패",
        message: "팀 스페이스 삭제 중 오류가 발생했습니다. 다시 시도해주세요.",
      });
    },
  });
};
