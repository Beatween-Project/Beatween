import { useQuery } from "@tanstack/react-query";
import { ResponseDto } from "../../../shared/types/Response.types";
import { CopySongListByCategoryDto } from "../types/CopySong.types";
import { getAllSongs } from "../services/CopySongService";

export const useCopySong = (spaceId: number) => {
  return useQuery<ResponseDto<CopySongListByCategoryDto[]>, Error>({
    queryKey: ["copySong", spaceId],
    queryFn: () => getAllSongs(spaceId!),
    enabled: !!spaceId,
    select: (response) => ({
      ...response,
      data: Array.isArray(response.data) ? response.data : [],
    }),
  });
};
