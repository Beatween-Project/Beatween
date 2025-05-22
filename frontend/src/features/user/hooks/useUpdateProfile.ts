import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/lib/toast";
import { updateProfile } from "../services/updateProfileService";
import { useParams } from "react-router-dom";
import { usePersonalSpaceStore } from "@/entities/band/model/store";
import { useUserImageVersionStore } from "@/entities/user/store/userVersionStore";

export const useUpdateProfile = () => {
  const { spaceId } = useParams();
  const queryClient = useQueryClient();
  const personalSpaceId = usePersonalSpaceStore(
    (state) => state.personalSpaceId
  );
  const updateVersion = useUserImageVersionStore(
    (state) => state.updateVersion
  );

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      if (data.success) {
        toast.success({
          title: "프로필 수정 성공",
          message: "성공적으로 저장되었습니다.",
        });
        queryClient.invalidateQueries({ queryKey: ["userInfo"] });
        if (spaceId) {
          queryClient.invalidateQueries({ queryKey: ["spaceDetail", spaceId] });
        } else if (personalSpaceId) {
          queryClient.invalidateQueries({
            queryKey: ["spaceDetail", personalSpaceId],
          });
        }
        updateVersion();
      } else {
        toast.warning({
          title: "프로필 수정 실패",
          message: "유효하지 않은 사용자입니다.",
        });
      }
    },
    onError: () => {
      toast.error({
        title: "프로필 수정 실패",
        message: "다시 시도해주세요.",
      });
    },
  });
};
