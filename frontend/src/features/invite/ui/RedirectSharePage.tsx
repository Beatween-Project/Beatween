import { useGlobalStore } from "@/app/store/globalStore";
import axiosInstance from "@/shared/api/axiosInstance";
import { toast } from "@/shared/lib/toast";
import { ResponseDto } from "@/shared/types/Response.types";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface JoinResponse {
  member: boolean;
  spaceId: number;
}

export const RedirectSharePage = () => {
  const { slug, shareKey } = useParams<{ slug: string; shareKey: string }>();
  const navigate = useNavigate();
  const isLoggedIn = useGlobalStore((state) => state.isLoggedIn);

  const { data, isError } = useQuery<ResponseDto<JoinResponse>>({
    queryKey: ["join-team", slug, shareKey],
    queryFn: () =>
      axiosInstance
        .get(`/api/v1/spaces/share/${slug}/${shareKey}`)
        .then((res) => res.data),
    enabled: !!slug && !!shareKey && isLoggedIn,
    retry: false,
  });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate(`/sign?slug=${slug}&shareKey=${shareKey}`);
      return;
    }

    if (!slug || !shareKey) {
      toast.error({
        title: "잘못된 링크",
        message: "초대 링크가 유효하지 않습니다.",
      });
      navigate("/");
      return;
    }

    if (isError) {
      toast.error({
        title: "가입 실패",
        message: "초대 참여에 실패했습니다. 다시 시도해주세요.",
      });
      navigate("/");
      return;
    }

    if (data?.success) {
      const { member, spaceId } = data.data;

      if (member) {
        toast.success({
          title: "가입 완료",
          message: "밴드에 성공적으로 가입했어요!",
        });
      } else {
        toast.info({
          title: "이미 멤버입니다",
          message: "이미 이 팀의 멤버예요.",
        });
      }

      navigate(`/team/${spaceId}`);
    }
  }, [isLoggedIn, slug, shareKey, data, isError]);

  return null;
};
