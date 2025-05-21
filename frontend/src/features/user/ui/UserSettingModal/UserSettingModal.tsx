import { useGlobalStore } from "@/app/store/globalStore";
import {
  UpdateProfileForm,
  UpdateProfileRef,
} from "@/features/user/ui/UpdateProfileForm";
import { openConfirm, openModal } from "@/shared/lib/modal";
import { toast } from "@/shared/lib/toast";
import { ButtonBox } from "@/shared/ui/Button";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { useUpdateProfile } from "../../hooks/useUpdateProfile";
import { Icon } from "@/shared/ui/Icon";

interface UserSettingModalProps {
  name?: string;
}

export const UserSettingModal = ({ name }: UserSettingModalProps) => {
  const navigate = useNavigate();
  const { logout } = useGlobalStore();
  const updateProfileFormRef = useRef<UpdateProfileRef>(null);
  const updateProfileMutation = useUpdateProfile();

  return (
    <div className="flex flex-col gap-3 px-2 pb-2 pt-3">
      <ButtonBox
        className="w-full text-left"
        onClick={() =>
          openModal({
            title: "프로필 수정하기",
            info: "나의 개성을 마음껏 드러내 보세요",
            children: <UpdateProfileForm ref={updateProfileFormRef} />,
            okText: "수정하기",
            onConfirm: () => {
              const formData = updateProfileFormRef.current?.getFormData();
              if (!formData) {
                toast.error({ title: "폼 데이터 없음" });
                return;
              }
              updateProfileMutation.mutate(formData);
            },
          })
        }
      >
        <div className="flex flex-wrap justify-between items-center">
          <div className="font-medium">{name}</div>
          <div className="flex text-neutral600">
            <Icon icon="arrow_forward_ios" size={16} />
          </div>
        </div>
      </ButtonBox>

      <ButtonBox
        className="w-full text-left"
        onClick={() => {
          logout();
          navigate("/");
        }}
      >
        로그아웃
      </ButtonBox>

      <div
        onClick={() =>
          openConfirm({
            title: "정말 탈퇴하시겠습니까?",
            info: "박자로 채워나간 우리 사이\n이대로 헤어지기 너무 아쉬워요😢",
            cancelText: "머무르기",
            okText: "탈퇴하기",
            onConfirm: () => console.log("탈퇴 구현 예정"),
            onCancel: () => console.log("취소됨"),
          })
        }
        className="text-right text-sm text-neutral600 px-5 pt-1"
      >
        회원탈퇴
      </div>
    </div>
  );
};
