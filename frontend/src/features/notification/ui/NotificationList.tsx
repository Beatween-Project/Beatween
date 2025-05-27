import { useNavigate } from "react-router-dom";
import { useMarkNotificationRead } from "../hooks/useMarkNotificationRead";
import { NotificationItem } from "./NotificationItem";
import { usePersonalSpaceStore } from "@/entities/band/model/store";
import {
  NotificationDto,
  notificationTypeLabelMap,
} from "../types/notification.types";
import { useDeleteNotification } from "../hooks/useDeleteNotification";
import { LoadingIcon } from "@/shared/ui/Loading";

interface NotificationListProps {
  notifications: NotificationDto[];
  isLoading?: boolean;
  error?: Error | null;
  closePopover?: () => void;
}

export const NotificationList = ({
  notifications,
  isLoading,
  error,
  closePopover,
}: NotificationListProps) => {
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: deleteNotification } = useDeleteNotification();
  const navigate = useNavigate();
  const personalSpaceId = usePersonalSpaceStore(
    (state) => state.personalSpaceId
  );

  if (isLoading) return <LoadingIcon color="blue" className="self-center" />;
  if (error) return <div>Error occurred: {error.message}</div>;

  return (
    <div className="flex flex-col gap-4 py-2">
      {notifications.map((notification) => {
        const typeLabel =
          notificationTypeLabelMap[
            notification.type as keyof typeof notificationTypeLabelMap
          ] ?? notification.type;
        return (
          <NotificationItem
            key={notification.user_notification_id}
            type={typeLabel}
            message={notification.content}
            createAt={notification.create_at}
            isRead={notification.is_read}
            onClick={() => {
              markRead(notification.user_notification_id, {
                onSuccess: (data) => {
                  const spaceId = data.data.spaceId;
                  if (spaceId === personalSpaceId) {
                    navigate("/");
                  } else {
                    navigate(`/team/${spaceId}`);
                  }
                  if (closePopover) closePopover();
                },
              });
            }}
            onClose={() => {
              deleteNotification(notification.user_notification_id);
            }}
          />
        );
      })}
    </div>
  );
};
