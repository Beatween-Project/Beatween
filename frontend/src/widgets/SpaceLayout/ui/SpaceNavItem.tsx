import { Icon } from "@/shared/ui/Icon";
import { Tooltip } from "@/shared/ui/Tooltip";
import { useState } from "react";

interface SpaceNavItemProps {
  isMe?: boolean;
  bandId?: number;
  imageUrl?: string;
  name?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const SpaceNavItem = ({
  isMe,
  bandId,
  imageUrl,
  name,
  isActive,
  onClick,
}: SpaceNavItemProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <>
      <Tooltip
        id={`${bandId}`}
        icon={imageError ? "cancel" : ""}
        title={imageError ? "Image Load Fail" : ""}
        text={name}
        direction="right"
        variant={imageError ? "error" : "light"}
        className={`group cursor-pointer rounded-xl transition-all ${
          isActive ? "bg-brandcolor200/30" : "hover:bg-neutral100/30"
        } `}
        onClick={onClick}
      >
        <div className="w-full h-full relative p-1.5">
          {/* 왼쪽의 작은 bar(for checking select, active...) */}
          <div
            className={`absolute w-1 ${
              isActive ? "h-6 bg-brandcolor200" : "h-3 bg-brandcolor100"
            } rounded-xl group-hover:bg-brandcolor200 left-0 top-[50%] -translate-y-[50%] transition-all`}
          ></div>
          <div
            className={`w-10 h-10 font-cafe24 rounded-xl overflow-hidden ${
              imageError
                ? "bg-error text-error"
                : !imageUrl && !isMe
                ? "bg-warning"
                : "bg-brandcolor200"
            } text-neutral1000 flex justify-center items-center`}
          >
            {isMe ? (
              <>MY</>
            ) : !imageUrl ? (
              <>
                <Icon icon="groups_3" fill />
              </>
            ) : imageError ? (
              <>
                <Icon icon="broken_image" fill tone="white" />
              </>
            ) : (
              <>
                <img
                  src={imageUrl}
                  alt={name}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover"
                />
              </>
            )}
          </div>
        </div>
      </Tooltip>
    </>
  );
};
