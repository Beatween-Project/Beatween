import { ImageBox } from "./ui/ImageBox";
import { PlaywithButton } from "./ui/PlaywithButton";
import { ImageCircle } from "@/shared/ui/ImageCircle";
import { useNavigate } from "react-router-dom";
import { openModal } from "@/shared/lib/modal";
import { toast } from "@/shared/lib/toast";
import { UpdateBandForm } from "@/features/updateBand/ui/UpdateBandForm";
import { Client } from "@stomp/stompjs";
import { useSocketStore } from "@/app/store/socketStore";
import SockJS from "sockjs-client";
import { NoteList } from "./ui/NoteList";
import { CreateSheetButton } from "@/features/createSheet/ui/CreateSheetButton";
import { useSpaceDetail } from "@/entities/band/hooks/useSpace";
import { ManageCategoryButton } from "@/features/manageCategory/ui/ManageCategoryButton";
import { useRef } from "react";
import { BandFormHandle } from "@/entities/band/ui/BandForm";
import { useUpdateBand } from "@/features/updateBand/hooks/useUpdateBand";
import { useSpaceVersionStore } from "@/entities/band/store/spaceVersionStore";
import { formatDate } from "@/shared/lib/formatDate";
import { DeleteBandButton } from "@/features/deleteBand/ui/DeleteBandButton";
import { ExitBandButton } from "@/features/deleteBand/ui/ExitBandButton";
import { InviteButton } from "@/features/invite/ui/InviteButton";
import { useGlobalStore } from "@/app/store/globalStore";
import axiosInstance from "@/shared/api/axiosInstance";

interface SpaceContentLayoutProps {
  type?: "personal" | "team";
  teamId?: number;
}

export const SpaceContentLayout = ({
  type = "team",
  teamId,
}: SpaceContentLayoutProps) => {
  if (!teamId) {
    return <div>잘못된 밴드 정보입니다.</div>;
  }

  const updateFormRef = useRef<BandFormHandle>(null);
  const { mutate: updateBandMutate } = useUpdateBand(Number(teamId));
  const navigate = useNavigate();
  const setStompClient = useSocketStore((state) => state.setStompClient);
  const versionSpace = useSpaceVersionStore((state) =>
    state.getVersion(teamId)
  );

  const handleConfirm = () => {
    const formData = updateFormRef.current?.getFormData();
    if (!formData) {
      toast.warning({
        title: "폼 데이터 없음",
        message: "폼이 제대로 입력되지 않았습니다.",
      });
      return;
    }
    updateBandMutate(formData);
  };

  const handlePlayWithClick = () => {
    const spaceId = String(teamId);
    const token = localStorage.getItem("accessToken");

    if (!token) {
      toast.error({
        title: "인증 실패",
        message: "로그인이 필요합니다.",
      });
      return;
    }

    const encodedToken = encodeURIComponent(`Bearer ${token}`);
    const wsUrl = `${
      import.meta.env.VITE_BROKER_URL
    }?spaceId=${spaceId}&token=${encodedToken}`;

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      connectHeaders: {
        spaceId,
      },
      debug: (msg) => console.log("🔹 STOMP DEBUG:", msg),
    });

    client.onConnect = async () => {
      console.log("✅ WebSocket connected");
      setStompClient(client);

      try {
        const res = await axiosInstance.get(
          `api/v1/play/spaces/${spaceId}/selected-song`
        );

        const data = res.data;

        if (res.status === 200 && data?.data?.copySongId) {
          console.log("🎵 선택된 곡 있음:", data.data.copySongId);
          navigate(`/room/${spaceId}`);
        } else {
          console.log("🕒 선택된 곡 없음");
          const isManager = useGlobalStore.getState().isManager;

          if (isManager) {
            console.log(
              "🎩 매니저입니다 → ScoreSelectModal이 자동 호출될 예정"
            );
            navigate(`/room/${spaceId}`);
          } else {
            toast.info({
              title: "대기 중",
              message: "관리자가 곡을 선택할 때까지 기다려 주세요.",
            });
            navigate(`/room/${spaceId}`);
          }
        }
      } catch (error) {
        console.error("❌ 선택된 곡 조회 실패:", error);
        toast.error({
          title: "요청 실패",
          message: "곡 정보를 불러오는 데 실패했습니다.",
        });
        navigate(`/room/${spaceId}`);
      }
    };

    client.activate();
  };

  const { data, error, isLoading } = useSpaceDetail(teamId);

  if (isLoading) return <div>로딩중...</div>;
  if (error) return <div>에러: {error.message}</div>;
  if (data && !data.success)
    return (
      <div className="py-6 text-warning font-bold">
        상정 가능한 범위의 오류 발생: {data.error?.message}
      </div>
    );

  const isOwner = data?.data.roleType === "OWNER";
  const bandData = data?.data;
  const versionedSpaceImageUrl = bandData?.imageUrl
    ? `${bandData.imageUrl}?t=${versionSpace}`
    : undefined;

  return (
    <div>
      <div className="relative flex flex-wrap gap-6 w-full px-6 py-7 min-w-fit z-[0]">
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-[6px] z-[-1]"
          style={{
            backgroundImage: `
              linear-gradient(to top, rgba(27, 32, 53, 1), rgba(27, 32, 53, 0)),
              url(${versionedSpaceImageUrl})
            `,
          }}
        />
        <ImageBox
          className="shrink-0"
          imageUrl={versionedSpaceImageUrl}
          onClick={() =>
            openModal({
              title: "밴드 수정하기",
              children: <UpdateBandForm ref={updateFormRef} spaceId={teamId} />,
              okText: "수정하기",
              onConfirm: handleConfirm,
            })
          }
        />
        <div className="py-2 flex flex-col gap-3 flex-grow text-left max-w-[70rem] self-center">
          <div>
            {bandData?.createAt && (
              <div className="text-neutral100/70 text-sm">
                {type === "team" ? "생성일 " : "가입일 "}
                {formatDate(bandData.createAt)}
              </div>
            )}
            <div className="text-2xl font-bold">
              {type === "personal" ? "MY MUSIC" : bandData?.spaceName}
            </div>
          </div>
          {bandData?.description && <div>{bandData.description}</div>}
          {type === "team" && (
            <div className="flex flew-wrap gap-2">
              {bandData?.members?.map((member, idx) => (
                <ImageCircle
                  key={idx}
                  imageUrl={
                    member.profileImageUrl
                      ? `${member.profileImageUrl}${
                          member.updateAt ? `?v=${member.updateAt}` : ""
                        }`
                      : undefined
                  }
                  alt={member.nickName}
                />
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {type === "team" && (
              <>
                <InviteButton spaceId={teamId} />
                {isOwner ? (
                  <DeleteBandButton spaceId={teamId} />
                ) : (
                  <ExitBandButton spaceId={teamId} />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="w-full flex flex-wrap gap-3 px-6 relative">
        <CreateSheetButton teamId={teamId} />
        {type === "team" && <PlaywithButton onClick={handlePlayWithClick} />}
      </div>

      <div className="px-6 py-10 flex flex-col gap-6">
        <div className="flex flex-wrap justify-between">
          <div className="text-2xl font-bold">악보 목록</div>
          <ManageCategoryButton spaceId={teamId} />
        </div>
        <NoteList teamId={teamId} />
      </div>
    </div>
  );
};
