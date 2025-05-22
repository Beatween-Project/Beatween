import { ButtonBox } from "@/shared/ui/Button";
import { useDeleteCopySong } from "../hooks/useDeleteCopySong";
import { toast } from "@/shared/lib/toast";
import { openConfirm } from "@/shared/lib/modal";

interface DeleteSongButtonProps {
  songId?: number;
  spaceId: number;
}

export const DeleteSongButton = ({
  songId,
  spaceId,
}: DeleteSongButtonProps) => {
  const deleteMutation = useDeleteCopySong();

  const handleDelete = () => {
    if (!songId) {
      toast.error({
        title: "삭제 실패",
        message: "삭제할 곡이 선택되지 않았습니다.",
      });
      return;
    }
    deleteMutation.mutate({ songId, spaceId });
  };

  return (
    <ButtonBox
      className="text-left"
      disabled={deleteMutation.isPending}
      onClick={() =>
        openConfirm({
          title: "정말 삭제하시겠습니까?",
          info: "한 번 지운 곡은 다시 되돌릴 수 없습니다",
          cancelText: "그만두기",
          okText: "삭제하기",
          onConfirm: () => handleDelete(),
          onCancel: () => {},
        })
      }
    >
      삭제하기
    </ButtonBox>
  );
};
