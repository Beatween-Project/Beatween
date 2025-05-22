import { usePersonalSpaceStore } from "@/entities/band/model/store";
import { SpaceContentLayout } from "@/widgets/SpaceContentLayout";

export const PersonalSpacePage = () => {
  const personalSpaceId = usePersonalSpaceStore(
    (state) => state.personalSpaceId
  );

  if (!personalSpaceId) return <div>Now Loading...</div>;

  return (
    <SpaceContentLayout teamId={Number(personalSpaceId)} type="personal" />
  );
};
