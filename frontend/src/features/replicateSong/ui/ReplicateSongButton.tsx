import { ButtonBox } from "@/shared/ui/Button";
import {
  ReplicateSongForm,
  ReplicateSongFormHandle,
} from "./ReplicateSongForm";
import { openModal } from "@/shared/lib/modal";
import { useReplicateSong } from "../hooks/useReplicateSong";
import { useRef } from "react";
import { toast } from "@/shared/lib/toast";

interface ReplicateSongButtonProps {
  songId?: number;
}

export const ReplicateSongButton = ({ songId }: ReplicateSongButtonProps) => {
  const formRef = useRef<ReplicateSongFormHandle>(null);
  const replicateMutation = useReplicateSong();

  const handleConfirm = () => {
    if (!songId) {
      toast.warning({
        title: "악곡 정보 없음",
        message: "악곡 정보가 제대로 받아와지지 않았습니다. 다시 시도해주세요.",
      });
      return;
    }

    const formData = formRef.current?.getFormData();
    if (!formData) return;

    if (!formData.dest_space_id) {
      toast.warning({
        title: "선택 오류",
        message: "스페이스를 선택해주세요.",
      });
      return;
    }

    replicateMutation.mutate({
      spaceId: formData.dest_space_id,
      songId,
      data: formData,
    });
  };

  return (
    <ButtonBox
      className="text-left"
      onClick={() =>
        openModal({
          title: "악보 복제하기",
          children: <ReplicateSongForm ref={formRef} />,
          okText: "복제하기",
          onConfirm: handleConfirm,
        })
      }
    >
      복제하기
    </ButtonBox>
  );
};
