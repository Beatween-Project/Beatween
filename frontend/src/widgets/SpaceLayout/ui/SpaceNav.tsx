import { SpaceNavItem } from "./SpaceNavItem";
import { useLocation, useNavigate } from "react-router-dom";
import { ImageCircle } from "@/shared/ui/ImageCircle/ImageCircle";
import { CreateBandButton } from "@/features/createBand";
import { Popover } from "@/shared/ui/Popover";
import { UserSettingModal } from "@/features/user/ui/UserSettingModal";
import { useSpace } from "@/entities/band/hooks/useSpace";
import { usePersonalSpaceStore } from "@/entities/band/model/store";
import { useEffect } from "react";
import { useParsedUserInfo } from "@/entities/user/hooks/useParsedUserInfo";
import { useUserImageVersionStore } from "@/entities/user/store/userVersionStore";
import { useSpaceVersionStore } from "@/entities/band/store/spaceVersionStore";

export const SpaceNav = () => {
  const location = useLocation();
  const isRoot = location.pathname === "/";
  const navigate = useNavigate();

  const { data: spaceData } = useSpace();
  const bands = spaceData?.data || [];

  const { userInfo } = useParsedUserInfo();

  const myBand = bands.find((band) => band.space_type === "PERSONAL");

  const setPersonalSpaceId = usePersonalSpaceStore(
    (state) => state.setPersonalSpaceId
  );

  useEffect(() => {
    if (myBand) {
      setPersonalSpaceId(myBand.space_id);
    }
  }, [myBand, setPersonalSpaceId]);

  const teamBands = bands.filter((band) => band.space_type === "TEAM");

  const versionUser = useUserImageVersionStore((state) => state.version);
  const versionedUserImageUrl = userInfo?.profileImageUrl
    ? `${userInfo.profileImageUrl}?v=${versionUser ?? 0}`
    : undefined;

  const versionSpace = useSpaceVersionStore((state) => state.getVersion);

  return (
    <aside className="h-full bg-neutral100/10 shadow-custom rounded-xl flex flex-col justify-between px-1 py-3">
      <nav className="flex flex-col items-center overflow-y-auto scroll-custom overflow-x-hidden gap-3">
        {/* My Band */}
        {myBand && (
          <SpaceNavItem
            isMe={true}
            bandId={myBand.space_id}
            name="나의 밴드"
            isActive={isRoot}
            onClick={() => {
              navigate("/");
            }}
          />
        )}
        {/* divider */}
        <div className="px-2 w-full">
          <div className="divider px-2" />
        </div>
        {/* Team Band */}
        {teamBands.map((band) => {
          const teamActive = location.pathname === `/team/${band.space_id}`;
          const version = versionSpace(band.space_id);
          const versionedSpaceImageUrl = band.img_url
            ? `${band.img_url}?t=${version}`
            : undefined;

          return (
            <SpaceNavItem
              key={band.space_id}
              bandId={band.space_id}
              imageUrl={versionedSpaceImageUrl}
              name={band.space_name}
              onClick={() => {
                navigate(`/team/${band.space_id}`);
              }}
              isActive={teamActive}
            />
          );
        })}

        {/* Add Team Band Button */}
        <div className="p-1">
          <CreateBandButton />
        </div>
      </nav>
      {/* account circle */}
      <div className="flex flex-col justify-center items-center gap-3 pt-3">
        {/* divider */}
        <div className="px-2 w-full">
          <div className="divider px-2" />
        </div>
        <div className="cursor-pointer">
          <Popover trigger={<ImageCircle imageUrl={versionedUserImageUrl} />}>
            <UserSettingModal name={userInfo?.name} />
          </Popover>
        </div>
      </div>
    </aside>
  );
};
