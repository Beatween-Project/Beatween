import { useMutation } from "@tanstack/react-query";
import { updateProfile } from "../services/updateProfileService";
import { toast } from "@/shared/lib/toast";

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success({
        title: "프로필 수정 성공",
        message: "성공적으로 저장되었습니다.",
      });
    },
    onError: () => {
      toast.error({
        title: "프로필 수정 실패",
        message: "다시 시도해주세요.",
      });
    },
  });
};
