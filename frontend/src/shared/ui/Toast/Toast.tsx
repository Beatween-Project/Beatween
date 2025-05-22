import { motion } from "framer-motion";
import { Toast } from "@/shared/lib/store/toastStore";
import classNames from "classnames";
import { Icon } from "../Icon";

export const ToastItem = ({ title, message, type }: Toast) => {
  const typeStyles = {
    success: {
      bgColor: "bg-success-gradient",
      textColor: "text-brandcolor200",
      icon: "check_circle",
    },
    warning: {
      bgColor: "bg-warning-gradient",
      textColor: "text-warning",
      icon: "warning",
    },
    error: {
      bgColor: "bg-error-gradient",
      textColor: "text-error",
      icon: "cancel",
    },
    info: {
      bgColor: "bg-neutral700/70",
      textColor: "text-neutral100",
      icon: "info",
    },
  };

  const { bgColor, textColor, icon } = typeStyles[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -200 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={classNames(
        "mb-2 px-3.5 py-4 rounded-xl text-white text-sm b-blur flex items-center justify-center gap-2 w-[18rem] max-w-[calc(100vw-2rem)]",
        bgColor
      )}
    >
      <div className={classNames("flex", textColor)}>
        <Icon icon={icon} fill />
      </div>
      <div className="flex-grow flex flex-col gap-1 justify-center">
        {title && <p className={classNames("font-bold", textColor)}>{title}</p>}
        {message && <p>{message}</p>}
      </div>
    </motion.div>
  );
};
