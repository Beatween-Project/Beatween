import { useNotificationStore } from "../store/useNotificationStore";
import { NotificationItem } from "./NotificationItem";

export const NotificationList = () => {
  const notifications = useNotificationStore((state) => state.notifications);

  return (
    <div>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          message={notification.message}
        />
      ))}
    </div>
  );
};
