import { toast } from "@/shared/lib/toast";
import { Button } from "@/shared/ui/Button";
import { useInviteLink } from "../hooks/useInvite";
import { useEffect, useState } from "react";

interface InviteButtonProps {
  spaceId: number;
}

export const InviteButton = ({ spaceId }: InviteButtonProps) => {
  const { data, isLoading, isError } = useInviteLink(spaceId);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  useEffect(() => {
    if (isError) {
      toast.error({
        title: "초대 링크 오류",
        message: "초대 링크를 불러오지 못했습니다. 다시 시도해주세요.",
      });
    }
  }, [isError]);

  const handleCopy = () => {
    if (copied) return;
    if (data?.data) {
      navigator.clipboard
        .writeText(`${import.meta.env.VITE_APP_BASE_URL}${data.data}`)
        .then(() => {
          toast.success({
            title: "복사 성공",
            message: "초대 링크가 클립보드로 복사되었습니다.",
          });
          setCopied(true);
        })
        .catch(() => {
          toast.error({
            title: "복사 실패",
            message: "클립보드 복사 중 오류가 발생했습니다. 다시 시도해주세요.",
          });
        });
    } else {
      toast.error({
        title: "링크 없음",
        message: "초대 링크를 불러오지 못했습니다. 다시 시도해주세요.",
      });
    }
  };

  return (
    <Button
      icon={copied ? "check" : "link"}
      color={isError ? "caution" : "green"}
      onClick={handleCopy}
      disabled={isLoading || isError || copied}
    >
      {isError
        ? "초대 링크 없음"
        : isLoading
        ? "초대 링크 로딩..."
        : copied
        ? "복사 완료!"
        : "초대 링크 복사"}
    </Button>
  );
};
