import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ResponseDto } from "@/shared/types/Response.types";
import { removeNotification } from "../services/NotificationService";
import { toast } from "@/shared/lib/toast";

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseDto<{}>, Error, number>({
    mutationFn: (userNotificationId) => removeNotification(userNotificationId),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        toast.success({
          title: "알림 삭제 완료",
          message: "알림이 성공적으로 삭제되었습니다.",
        });
      } else {
        toast.error({
          title: "알림 삭제 실패",
          message: "알림 삭제에 실패했습니다. 다시 시도해주세요.",
        });
      }
    },
    onError: () => {
      toast.error({
        title: "서버 오류",
        message:
          "서버와의 통신 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
      });
    },
  });
};
