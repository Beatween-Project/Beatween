import { openConfirm } from "@/shared/lib/modal";
import { Button } from "@/shared/ui/Button";
import { useDeleteTeamSpace } from "../hooks/useDeleteExitBand";
import { useNavigate } from "react-router-dom";

interface DeleteBandButtonProps {
  spaceId: number;
}

export const DeleteBandButton = ({ spaceId }: DeleteBandButtonProps) => {
  const deleteMutation = useDeleteTeamSpace();
  const navigate = useNavigate();

  return (
    <Button
      icon="delete"
      fill
      color="caution"
      onClick={() =>
        openConfirm({
          title: "정말 밴드를 삭제하시겠습니까?",
          info: "한 번 지운 밴드는 다시 되돌릴 수 없습니다",
          cancelText: "그만두기",
          okText: "삭제하기",
          onConfirm: () => {
            deleteMutation.mutate({ spaceId });
            navigate("/");
          },
        })
      }
    >
      밴드 삭제하기
    </Button>
  );
};
