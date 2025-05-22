import { openModal } from "@/shared/lib/modal";
import { ButtonBox } from "@/shared/ui/Button";
import { useRef } from "react";
import { useUpdateProfile } from "@/features/user/hooks/useUpdateProfile";
import { UpdateProfileForm, UpdateProfileRef } from "./UpdateProfileForm";

export const UpdateProfileButton = () => {
  const updateMutation = useUpdateProfile();
  const updateProfileFormRef = useRef<UpdateProfileRef>(null);

  const handleConfirm = () => {
    const formData = updateProfileFormRef.current?.getFormData();
    console.log(formData);
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
