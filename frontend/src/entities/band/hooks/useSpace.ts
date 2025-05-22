import { ResponseDto } from "@/shared/types/Response.types";
import { useQuery } from "@tanstack/react-query";
import { SpaceDetailDto, SpacePreDto } from "../types/Space.types";
import { getSpaces } from "../services/SpaceService";
import { fetchSpaceDetail } from "../api/SpaceApi";

export const useSpace = () => {
  return useQuery<ResponseDto<SpacePreDto[]>, Error>({
    queryKey: ["spaces"],
    queryFn: getSpaces,
  });
};

export const useSpaceDetail = (spaceId: number) => {
  return useQuery<ResponseDto<SpaceDetailDto>, Error>({
    queryKey: ["spaceDetail", spaceId],
    queryFn: () => fetchSpaceDetail(spaceId),
    enabled: !!spaceId,
  });
};
