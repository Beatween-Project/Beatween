import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ResponseDto } from "@/shared/types/Response.types";
import { updateUserNotification } from "../services/NotificationService";

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseDto<{ spaceId: number }>, Error, number>({
    mutationFn: (userNotificationId) =>
      updateUserNotification(userNotificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
