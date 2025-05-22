import { useQuery } from "@tanstack/react-query";
import { ResponseDto } from "@/shared/types/Response.types";
import { getInviteLink } from "../services/inviteService";

export const useInviteLink = (spaceId: number) => {
  return useQuery<ResponseDto<string>, Error>({
    queryKey: ["inviteLink", spaceId],
    queryFn: () => getInviteLink(spaceId),
    enabled: !!spaceId,
  });
};
