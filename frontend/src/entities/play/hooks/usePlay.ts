import { useQuery } from "@tanstack/react-query";
import { getPlayState } from "../services/PlayService";
import { PlayControlMessage } from "../types/Play.types";

export const usePlayState = (spaceId?: string) => {
  return useQuery<PlayControlMessage, Error>({
    queryKey: ["playState", spaceId],
    queryFn: () => getPlayState(spaceId!),
    enabled: !!spaceId,
  });
};
