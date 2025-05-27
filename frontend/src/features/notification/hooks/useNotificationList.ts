import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../services/NotificationService";
import { NotificationDto } from "../types/notification.types";
import { ResponseDto } from "@/shared/types/Response.types";

export const useNotificationList = () => {
  return useQuery<ResponseDto<NotificationDto[]>, Error>({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(),
  });
};
