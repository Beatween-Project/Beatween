import { useGlobalStore } from "@/app/store/globalStore";
import axiosInstance from "@/shared/api/axiosInstance";
import { toast } from "@/shared/lib/toast";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface JoinResponse {
  isMember: boolean;
  spaceId: number;
}

export const RedirectSharePage = () => {
  const { slug, shareKey } = useParams<{ slug: string; shareKey: string }>();
  const navigate = useNavigate();
  const isLoggedIn = useGlobalStore((state) => state.isLoggedIn);
  const clientId = useGlobalStore((state) => state.clientId);

  const joinMutation = useMutation<
    JoinResponse,
    unknown,
    { userId: number; slug: string; shareKey: string }
  >({
    mutationFn: ({ userId, slug, shareKey }) =>
      axiosInstance
        .post("/api/v1/spaces/join", {
          userId,
          slug,
          shareKey,
        })
        .then((res) => res.data),
  });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/sign");
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

    joinMutation.mutate(
      { userId: clientId, slug, shareKey },
      {
        onSuccess: ({ isMember, spaceId }) => {
          if (isMember) {
            toast.success({
              title: "가입 완료",
              message: "팀에 성공적으로 참여했어요!",
            });
          } else {
            toast.info({
              title: "이미 멤버입니다",
              message: "이미 이 팀의 멤버예요.",
            });
          }
          navigate(`/team/${spaceId}`);
        },
        onError: () => {
          toast.error({
            title: "가입 실패",
            message: "초대 참여에 실패했습니다. 다시 시도해주세요.",
          });
          navigate("/");
        },
      }
    );
  }, [isLoggedIn, slug, shareKey]);

  return null;
};
