import { SpaceContentLayout } from "@/widgets/SpaceContentLayout";
import { useParams } from "react-router-dom";

export const TeamSpacePage = () => {
  const { teamId } = useParams();
  const parsedTeamId = teamId ? Number(teamId) : undefined;

  if (!parsedTeamId) return <div>잘못된 접근입니다.</div>;

  return <SpaceContentLayout teamId={parsedTeamId} />;
};
