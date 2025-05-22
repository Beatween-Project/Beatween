import { fetchPlayState } from "../api/PlayApi";
import { PlayControlMessage } from "../types/Play.types";

export const getPlayState = async (
  spaceId: string
): Promise<PlayControlMessage> => {
  try {
    return await fetchPlayState(spaceId);
  } catch (error) {
    console.error("Failed to get play state", error);
    throw error;
  }
};
