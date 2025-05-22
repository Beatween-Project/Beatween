import { openModal } from "@/shared/lib/modal";
import { Button } from "@/shared/ui/Button";
import {
  ManageCategoryForm,
  ManageCategoryFormHandles,
} from "./ManageCategoryForm";
import { useRef } from "react";

interface ManageCategoryButtonProps {
  spaceId: number;
}

export const ManageCategoryButton = ({
  spaceId,
}: ManageCategoryButtonProps) => {
  const formRef = useRef<ManageCategoryFormHandles>(null);

  return (
    <Button
      icon="settings"
      fill
      size="small"
      onClick={() =>
        openModal({
          title: "카테고리 관리하기",
          children: <ManageCategoryForm spaceId={spaceId} ref={formRef} />,
          okText: "만들기",
          onConfirm: () => {
            formRef.current?.addCreateLine();
          },
          buttonType: "icon",
          icon: "add_circle",
          fill: true,
        })
      }
    >
      카테고리 관리하기
    </Button>
  );
};
