import { useGlobalStore } from "@/app/store/globalStore";
import { EventSourcePolyfill } from "event-source-polyfill";
import {
  deleteNotification,
  fetchNotifications,
  updateUserNotificationApi,
} from "../api/notificationApi";
import { ResponseDto } from "@/shared/types/Response.types";
import { NotificationDto } from "../types/notification.types";

export const subscribeSheetStatus = (spaceId: number): EventSource => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = useGlobalStore.getState().accessToken;
  if (!token) throw new Error("No access token available");

  const url = `${baseUrl}/api/v1/spaces/${spaceId}/songs/sheets/subscribe`;
  return new EventSourcePolyfill(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
};

export const getNotifications = async (): Promise<
  ResponseDto<NotificationDto[]>
> => {
  try {
    return await fetchNotifications();
  } catch (err) {
    console.error("Failed to fetch notifications", err);
    throw err;
  }
};

export const updateUserNotification = async (
  userNotificationId: number
): Promise<ResponseDto<{ spaceId: number }>> => {
  try {
    const res = await updateUserNotificationApi(userNotificationId);
    return res;
  } catch (err) {
    console.error(`Failed to update notification ${userNotificationId}`, err);
    throw err;
  }
};

export const removeNotification = async (
  userNotificationId: number
): Promise<ResponseDto<{}>> => {
  try {
    const res = await deleteNotification(userNotificationId);
    return res;
  } catch (err) {
    console.error(`Failed to delete notification ${userNotificationId}`, err);
    throw err;
  }
};
