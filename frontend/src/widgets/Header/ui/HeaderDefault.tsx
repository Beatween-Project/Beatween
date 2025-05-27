import { useGlobalStore } from "@/app/store/globalStore";
import { Icon, IconButton } from "@/shared/ui/Icon";
import { Button } from "@/shared/ui/Button";
import { Logo } from "@/shared/ui/Logo";
import classNames from "classnames";
import { HtmlHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { Popover } from "@/shared/ui/Popover";
import { useSheetStore } from "@/features/createSheet/store/useSheetStore";
import { NotificationList } from "@/features/notification/ui/NotificationList";
import { useNotificationList } from "@/features/notification/hooks/useNotificationList";
import { LoadingIcon } from "@/shared/ui/Loading";

interface HeaderDefaultProps extends HtmlHTMLAttributes<HTMLDivElement> {
  text?: String;
  onLogoClick?: () => void;
  onShrink?: () => void;
  onExpand?: () => void;
  isSignPage?: boolean;
}

export const HeaderDefault = ({
  text,
  onLogoClick,
  onShrink,
  onExpand,
  isSignPage,
  className,
  ...props
}: HeaderDefaultProps) => {
  const isLoggedIn = useGlobalStore((state) => state.isLoggedIn);
  const isCreating = useSheetStore((state) => state.isCreating);

  const { data, isLoading, error } = useNotificationList();
  const notifications = data?.data ?? [];
  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <header
      className={classNames(
        "z-40 h-[3.525rem] w-full flex bg-neutral100/30 justify-between items-center px-6 py-2 border-b border-neutral100/30 b-blur",
        className
      )}
      {...props}
    >
      <div>
        <Logo onClick={onLogoClick} />
      </div>
      {text && <div>{text}</div>}
      {isCreating && (
        <div className="text-brandcolor200 flex flex-wrap gap-2 items-center">
          악보를 생성중입니다...
          <LoadingIcon />
        </div>
      )}
      <div>
        {isLoggedIn ? (
          <Popover
            directionY="bottom"
            className={`translate-x-[.5rem] max-h-[min(28rem,calc(100vh-4.525rem))] flex flex-col pb-0 px-0`}
            trigger={
              <div className="flex relative">
                <IconButton icon="notifications" fill className="-mr-2" />
                {hasUnread && (
                  <span className="absolute top-0 right-0 translate-y-1 w-2 h-2 bg-red rounded-full" />
                )}
              </div>
            }
          >
            {(closePopover) => (
              <>
                <div className="px-4 pb-3 pt-1 text-lg font-bold text-left border-b">
                  알림
                </div>
                <div className="p-5 bg-neutral200 flex flex-col gap-2 overflow-y-auto scroll-custom">
                  <NotificationList
                    notifications={notifications}
                    isLoading={isLoading}
                    error={error}
                    closePopover={closePopover}
                  />
                </div>
              </>
            )}
          </Popover>
        ) : !isSignPage ? (
          <motion.div
            key="login-button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button onClick={onShrink} color="green" icon="login">
              로그인/회원가입하러 가기
            </Button>
          </motion.div>
        ) : null}
      </div>
    </header>
  );
};
