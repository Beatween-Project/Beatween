import { openConfirm } from "@/shared/lib/modal";
import { Button } from "@/shared/ui/Button";
import { useDeleteTeamSpace } from "../hooks/useDeleteExitBand";
import { useNavigate } from "react-router-dom";

interface ExitBandButtonProps {
  spaceId: number;
}

export const ExitBandButton = ({ spaceId }: ExitBandButtonProps) => {
  const deleteMutation = useDeleteTeamSpace();
  const navigate = useNavigate();

  return (
    <Button
      icon="logout"
      color="caution"
      onClick={() =>
        openConfirm({
          title: "정말 밴드를 나가시겠습니까?",
          info: "다시 밴드에 들어가기 위해서는 밴드 관리자의 초대가 필요합니다",
          cancelText: "아니오",
          okText: "나가기",
          onConfirm: () => {
            deleteMutation.mutate({ spaceId });
            navigate("/");
          },
        })
      }
    >
      밴드 나가기
    </Button>
  );
};
