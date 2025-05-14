import { useState, useRef, useEffect, ReactNode } from "react";
import { PanelModal } from "../Panel";

interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
}

export const Popover = ({ trigger, children }: PopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  const togglePopover = () => {
    setIsOpen(!isOpen);
  };

  // 외부 클릭시 창 닫음
  const handleOutsideClick = (event: any) => {
    if (
      popoverRef.current &&
      !popoverRef.current.contains(event.target as Node) &&
      triggerRef.current &&
      !triggerRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
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
      <div onClick={togglePopover} ref={triggerRef}>
        {trigger}
      </div>

      {isOpen && (
        <div ref={popoverRef}>
          <PanelModal
            tone="white"
            className="absolute min-w-[16rem] z-10 top-0 -translate-y-[calc(100%+.5rem)] left-0 p-2 text-neutral1000"
          >
            {children}
          </PanelModal>
        </div>
      )}
    </div>
  );
};
