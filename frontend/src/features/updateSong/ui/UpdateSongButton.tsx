import { openModal } from "@/shared/lib/modal";
import { toast } from "@/shared/lib/toast";
import { ButtonBox } from "@/shared/ui/Button";
import { UpdateSongForm, UpdateSongFormHandle } from "./UpdateSongForm";
import { useUpdateSong } from "../hooks/useUpdateCopySong";
import { CopySongDto } from "@/entities/song/types/CopySong.types";
import { useRef } from "react";

interface UpdateSongButtonProps {
  spaceId: number;
  song?: CopySongDto;
}

export const UpdateSongButton = ({ spaceId, song }: UpdateSongButtonProps) => {
  const updateMutation = useUpdateSong();
  const updateSongFormRef = useRef<UpdateSongFormHandle>(null);

  const handleConfirm = () => {
    if (!song?.song_id) {
      toast.error({
        title: "수정 실패",
        message: "수정할 곡이 선택되지 않았습니다.",
      });
      return;
    }

    const formData = updateSongFormRef.current?.getFormData();
    if (!formData) {
      toast.error({ title: "폼 데이터가 없습니다." });
      return;
    }

    updateMutation.mutate({ spaceId, songId: song.song_id, formData });
  };

  return (
    <ButtonBox
      className="text-left"
      disabled={updateMutation.isPending}
      onClick={() =>
        openModal({
          title: "악보 수정하기",
          children: (
            <UpdateSongForm
              ref={updateSongFormRef}
              spaceId={spaceId}
              song={song}
            />
          ),
          okText: "수정하기",
          onConfirm: handleConfirm,
        })
      }
    >
      수정하기
    </ButtonBox>
  );
};
