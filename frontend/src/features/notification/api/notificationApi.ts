import { ResponseDto } from "@/shared/types/Response.types";
import { NotificationDto } from "../types/notification.types";
import axiosInstance from "@/shared/api/axiosInstance";

export const fetchNotifications = async (): Promise<
  ResponseDto<NotificationDto[]>
> => {
  const res = await axiosInstance.get<ResponseDto<NotificationDto[]>>(
    `/api/v1/notifications/`
  );
  return res.data;
};

export const updateUserNotificationApi = async (
  userNotificationId: number
): Promise<ResponseDto<{ spaceId: number }>> => {
  const res = await axiosInstance.patch<ResponseDto<{ spaceId: number }>>(
    `/api/v1/notifications/${userNotificationId}`
  );
  return res.data;
};

export const deleteNotification = async (
  userNotificationId: number
): Promise<ResponseDto<{}>> => {
  const res = await axiosInstance.delete(
    `/api/v1/notifications/${userNotificationId}`
  );
  return res.data;
};
