import { Icon } from "@/shared/ui/Icon";

interface ImageBoxProps {
  className?: String;
  onClick?: () => void;
  imageUrl?: string | null;
}

export const ImageBox = ({ className, onClick, imageUrl }: ImageBoxProps) => {
  return (
    <div
      className={`w-[13rem] h-[13rem] bg-neutral100/30 rounded-md border-2 border-neutral100 relative overflow-hidden ${className}`}
    >
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt="Band Image"
            className="w-full h-full object-cover rounded-md"
          />
          {/* 그라데이션 오버레이 */}
          <div className="absolute bottom-0 left-0 right-0 h-20 rounded-md pointer-events-none bg-gradient-to-t from-neutral1000/70 to-transparent" />
        </>
      ) : null}
      <div
        onClick={onClick}
        className="flex absolute right-0 bottom-0 -translate-x-2 -translate-y-2 text-neutral300 hover:text-brandcolor200 transition-all cursor-pointer"
      >
        <Icon icon="settings" fill size={32} />
      </div>
    </div>
  );
};
