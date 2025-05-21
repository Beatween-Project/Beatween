import { openModal } from "@/shared/lib/modal";
import { ButtonBox } from "@/shared/ui/Button";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { UpdateProfileForm, UpdateProfileRef } from "./UpdateProfileForm";
import { useRef } from "react";

export const UpdateProfileButton = () => {
  const updateMutation = useUpdateProfile();
  const updateProfileFormRef = useRef<UpdateProfileRef>(null);

  const handleConfirm = () => {
    const formData = updateProfileFormRef.current?.getFormData();
    if (!formData) return;

    updateMutation.mutate(formData);
  };

  return (
    <ButtonBox
      className="text-left"
      disabled={updateMutation.isPending}
      onClick={() =>
        openModal({
          title: "프로필 수정하기",
          children: <UpdateProfileForm ref={updateProfileFormRef} />,
          okText: "저장하기",
          onConfirm: handleConfirm,
        })
      }
    >
      프로필 수정
    </ButtonBox>
  );
};
