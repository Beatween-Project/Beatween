import { useRef, useEffect, ReactNode, useMemo } from "react";
import { PanelModal } from "../Panel";
import { nanoid } from "nanoid";
import { usePopoverStore } from "@/shared/lib/store/popoverStore";

interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  directionY?: "top" | "bottom";
  className?: String;
}

export const Popover = ({
  trigger,
  children,
  directionY = "top",
  className,
}: PopoverProps) => {
  const id = useMemo(() => nanoid(), []);

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  const { openId, setOpenId } = usePopoverStore();
  const isOpen = openId === id;

  const closePopover = () => setOpenId(null);
  const togglePopover = () => {
    setOpenId(isOpen ? null : id);
  };

  // 외부 클릭시 창 닫음
  const handleOutsideClick = (event: MouseEvent) => {
    if (
      popoverRef.current &&
      !popoverRef.current.contains(event.target as Node) &&
      triggerRef.current &&
      !triggerRef.current.contains(event.target as Node)
    ) {
      setOpenId(null);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <div className="relative">
      <div
        onClick={(e) => {
          e.stopPropagation();
          togglePopover();
        }}
        ref={triggerRef}
      >
        {trigger}
      </div>

      {isOpen && (
        <div ref={popoverRef}>
          <PanelModal
            onClick={(e) => e.stopPropagation()}
            tone="white"
            className={`absolute min-w-[16rem] z-10 p-2 text-neutral1000 ${
              directionY === "top"
                ? "top-0 left-0 -translate-y-[calc(100%+.5rem)]"
                : "bottom-0 right-0 translate-y-[calc(100%+.5rem)]"
            } ${className}`}
          >
            {typeof children === "function"
              ? (children as (close: () => void) => ReactNode)(closePopover)
              : children}
          </PanelModal>
        </div>
      )}
    </div>
  );
};
