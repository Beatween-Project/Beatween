import { CopySongDto } from "@/entities/song/types/CopySong.types";
import { DeleteSongButton } from "@/features/deleteSong/ui/DeleteSongButton";
import { ReplicateSongButton } from "@/features/replicateSong/ui/ReplicateSongButton";
import { UpdateSongButton } from "@/features/updateSong/ui/UpdateSongButton";

interface NotePopoverProps {
  spaceId: number;
  song?: CopySongDto;
}

export const NotePopover = ({ spaceId, song }: NotePopoverProps) => {
  return (
    <div className="flex flex-col gap-2 p-2">
      <UpdateSongButton spaceId={spaceId} song={song} />
      <ReplicateSongButton songId={song?.song_id} />
      <DeleteSongButton songId={song?.song_id} spaceId={spaceId} />
    </div>
  );
};
