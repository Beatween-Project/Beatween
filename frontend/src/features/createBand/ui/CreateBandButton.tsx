import { IconButton } from "@/shared/ui/Icon";
import { openModal } from "@/shared/lib/modal";
import { CreateBandForm } from "./CreateBandForm";
import { toast } from "@/shared/lib/toast";
import { BandFormHandle } from "@/entities/band/ui/BandForm";
import { useRef } from "react";
import { useCreateBand } from "../hooks/useCreateBand";

export const CreateBandButton = () => {
  const createBandFormRef = useRef<BandFormHandle>(null);
  const mutation = useCreateBand();

  const handleConfirm = () => {
    const formData = createBandFormRef.current?.getFormData();
    if (!formData) {
      toast.error({
        title: "폼 데이터 없음",
        message: "밴드 정보를 입력해주세요.",
      });
      return;
    }

    const name = formData.get("bandName") as string;
    const description = formData.get("bandDetail") as string;
    const image = formData.get("bandImage") as File;

    if (!name) {
      toast.error({
        title: "이름은 필수입니다",
        message: "밴드 이름을 입력해주세요.",
      });
      return;
    }

    mutation.mutate(
      {
        name,
        description,
        image: image && image.size > 0 ? image : null,
      },
      {
        onSuccess: (data) => {
          toast.success({
            title: "밴드 생성 성공",
            message: "공유 링크가 클립보드에 복사되었습니다!",
          });
          navigator.clipboard.writeText(data.share_url);
        },
        onError: (err) => {
          toast.error({
            title: "밴드 생성 실패",
            message: err.message,
          });
        },
      }
    );
  };

  return (
    <IconButton
      icon="add_circle"
      tone="light"
      fill
      round="xl"
      onClick={() =>
        openModal({
          title: "밴드 만들기",
          info: "밴드는 동료들과 악보를 공유하는 공간입니다\n이름과 이미지로 밴드의 개성을 드러내 보세요",
          children: <CreateBandForm ref={createBandFormRef} />,
          okText: mutation.isPending ? "만드는 중..." : "만들기",
          onConfirm: handleConfirm,
        })
      }
    />
  );
};
