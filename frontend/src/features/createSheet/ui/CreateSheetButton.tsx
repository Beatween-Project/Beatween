import { openModal } from "@/shared/lib/modal";
import { SpaceButtonPanel } from "@/widgets/SpaceContentLayout/ui/SpaceButtonPanel";
import { toast } from "@/shared/lib/toast";
import { Icon } from "@/shared/ui/Icon";
import { useRef } from "react";
import { CreateSheetForm, CreateSheetFormHandle } from "./CreateSheetForm";
import { useCreateSheetWithNotification } from "../hooks/useCreateSheetWithNotification";

interface CreateSheetButtonProps {
  teamId: number | undefined;
}

export const CreateSheetButton = ({ teamId }: CreateSheetButtonProps) => {
  if (teamId === undefined) {
    toast.error({
      title: "오류",
      message: "팀 정보가 없습니다.",
    });
    return;
  }

  // const { mutate: createSheet } = useCreateSheet({ spaceId: teamId });
  const { startCreateSheet } = useCreateSheetWithNotification(teamId);
  const formRef = useRef<CreateSheetFormHandle>(null);

  return (
    <SpaceButtonPanel
      onClick={() =>
        openModal({
          title: "악보 생성하기",
          info: "유튜브 링크를 입력해서 악보를 생성해 보세요!",
          children: <CreateSheetForm ref={formRef} />,
          okText: "생성하기",
          onConfirm: () => {
            const youtubeUrl = formRef.current?.getYoutubeUrl() ?? "";

            if (!youtubeUrl) {
              toast.error({
                title: "링크 없음",
                message: "유튜브 링크를 입력해주세요.",
              });
              return false; // 모달 닫지 않음
            }

            // createSheet({ youtube_url: youtubeUrl });
            startCreateSheet(youtubeUrl);
            return true; // 모달 닫음
          },
        })
      }
    >
      <div className="flex text-brandcolor200/70">
        <Icon icon="music_note_add" size={40} />
      </div>
      <div className="text-xl font-bold text-brandcolor200">악보 생성하기</div>
    </SpaceButtonPanel>
  );
};
