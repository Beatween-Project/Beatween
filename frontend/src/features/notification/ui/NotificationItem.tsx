interface NotificationItemProps {
  message: String;
}

export const NotificationItem = ({ message }: NotificationItemProps) => {
  return (
    <div className="bg-neutral200 rounded-full p-3 cursor-pointer">
      {message}
    </div>
  );
};
