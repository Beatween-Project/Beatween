import { CopySongDto } from "@/entities/song/types/CopySong.types";
import { SongForm, SongFormHandle } from "@/entities/song/ui/SongForm";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { ReplicateSongRequest } from "../types/replicateSong.types";

export interface ReplicateSongFormHandle {
  getFormData: () => ReplicateSongRequest;
}

interface ReplicateSongFormProps {
  spaceId?: number;
  song?: CopySongDto;
}

export const ReplicateSongForm = forwardRef<
  ReplicateSongFormHandle,
  ReplicateSongFormProps
>(({ spaceId, song }, ref) => {
  const songFormRef = useRef<SongFormHandle>(null);

  useImperativeHandle(ref, () => ({
    getFormData() {
      return (
        (songFormRef.current?.getFormData() as ReplicateSongRequest) ?? {
          dest_space_id: 0,
          category_id: 0,
        }
      );
    },
  }));

  return (
    <SongForm
      ref={songFormRef}
      mode="replicate"
      spaceId={spaceId}
      song={song}
    />
  );
});
