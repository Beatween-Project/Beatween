import { CopySongDto } from "@/entities/song/types/CopySong.types";
import { SongForm, SongFormHandle } from "@/entities/song/ui/SongForm";
import { forwardRef, useImperativeHandle, useRef } from "react";

export interface UpdateSongFormHandle {
  getFormData: () => FormData;
}

interface UpdateSongFormProps {
  spaceId?: number;
  song?: CopySongDto;
}

export const UpdateSongForm = forwardRef<
  UpdateSongFormHandle,
  UpdateSongFormProps
>(({ spaceId, song }, ref) => {
  const songFormRef = useRef<SongFormHandle>(null);

  useImperativeHandle(ref, () => ({
    getFormData() {
      return (songFormRef.current?.getFormData() ?? new FormData()) as FormData;
    },
  }));

  return <SongForm ref={songFormRef} spaceId={spaceId} song={song} />;
});
