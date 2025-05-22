import axiosInstance from "@/shared/api/axiosInstance";
import { PlayControlMessage } from "../types/Play.types";

export const fetchPlayState = async (
  spaceId: string
): Promise<PlayControlMessage> => {
  const res = await axiosInstance.get<PlayControlMessage>(
    `/api/v1/play/state/${spaceId}`
  );
  return res.data;
};
