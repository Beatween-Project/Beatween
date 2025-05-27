import { formatRelativeDate } from "@/shared/lib/formatDate";
import { Icon, IconButton } from "@/shared/ui/Icon";
import { parseMessageToParts, renderParsedParts } from "../lib/parseMessage";

interface NotificationItemProps {
  type?: string;
  message: string;
  isRead?: boolean;
  createAt?: string;
  onClick?: () => void;
  onClose?: () => void;
}

export const NotificationItem = ({
  type,
  message,
  isRead,
  createAt,
  onClick,
  onClose,
}: NotificationItemProps) => {
  const parts = parseMessageToParts(message);

  return (
    <div
      onClick={onClick}
      className={`bg-neutral100 rounded-xl py-2 pl-4 pr-2 cursor-pointer w-[20rem] max-w-full flex flex-col shadow-md`}
    >
      <div className="flex justify-between items-center">
        <div className="flex flex-wrap flex-grow gap-2 items-center">
          <div className="relative flex">
            {!isRead && (
              <div className="absolute rounded-full w-2 h-2 bg-brandcolor200" />
            )}
            <div className="flex ml-0.5 text-neutral800">
              {isRead ? (
                <Icon icon="drafts" fill size={20} />
              ) : (
                <Icon icon="mail" fill size={20} />
              )}
            </div>
          </div>
          <div className="font-bold">{type}</div>
          <div className="w-1 h-1 bg-neutral500 rounded-full" />
          <div className="text-neutral500 text-sm text-left">
            {formatRelativeDate(createAt)}
          </div>
        </div>

        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          icon="close"
          tone="black"
          size={20}
        />
      </div>

      <div className="flex-grow text-left mr-2">{renderParsedParts(parts)}</div>
    </div>
  );
};
