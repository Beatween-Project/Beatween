import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/lib/toast";
import { updateBand } from "../services/updateBandService";
import { SpaceDetailResponseDto } from "../types/updateBand.types";
import { useSpaceVersionStore } from "@/entities/band/store/spaceVersionStore";

export const useUpdateBand = (spaceId: number) => {
  const queryClient = useQueryClient();
  const updateSpaceVersion = useSpaceVersionStore(
    (state) => state.updateVersion
  );

  return useMutation({
    mutationFn: (formData: FormData) => updateBand(spaceId, formData),
    onSuccess: (data: {
      success: boolean;
      data: SpaceDetailResponseDto | string;
    }) => {
      if (data.success) {
        toast.success({
          title: "밴드 수정 성공",
          message: "성공적으로 저장되었습니다.",
        });
        queryClient.invalidateQueries({ queryKey: ["spaceDetail", spaceId] });
        queryClient.invalidateQueries({ queryKey: ["spaces"] });
        updateSpaceVersion(spaceId);
      } else {
        toast.warning({
          title: "밴드 수정 실패",
          message: data.data?.toString() ?? "알 수 없는 오류입니다.",
        });
      }
    },
    onError: () => {
      toast.error({
        title: "밴드 수정 실패",
        message: "다시 시도해주세요.",
      });
    },
  });
};
