import { Icon, IconButton } from "@/shared/ui/Icon";
import { Popover } from "@/shared/ui/Popover";
import { NotePopover } from "./NotePopover";
import { CopySongDto } from "@/entities/song/types/CopySong.types";
import { useState } from "react";

interface NoteItemProps {
  song?: CopySongDto;
  teamId: number;
  onClick?: () => void;
}

export const NoteItem = ({ song, teamId, onClick }: NoteItemProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      onClick={onClick}
      className="w-[13.5rem] p-3 pb-2 hover:scale-[104%] transition-all duration-300 rounded-lg flex flex-col gap-2 cursor-pointer"
    >
      {/* image */}
      <div className="w-[12rem] h-[12rem] rounded-lg overflow-hidden">
        {!song?.thumbnail_url ? (
          <div className="w-full h-full bg-neutral100/30 flex flex-col gap-2 justify-center items-center">
            No image
          </div>
        ) : imageError ? (
          <div className="w-full h-full bg-error/30 flex flex-col gap-2 justify-center items-center">
            <Icon icon="broken_image" fill tone="white" size={48} />
            Image Error
          </div>
        ) : (
          <img
            src={`${song.thumbnail_url}${
              song.updated_at ? `?v=${song.updated_at}` : ""
            }`}
            alt={`${song.title} image`}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="w-full flex flex-wrap items-center justify-between px-1">
        <div className="line-clamp-2 text-lg text-left w-[calc(100%-40px)]">
          {song?.title}
        </div>
        <Popover trigger={<IconButton icon="more_horiz" />}>
          <NotePopover spaceId={teamId} song={song} />
        </Popover>
      </div>
    </div>
  );
};
