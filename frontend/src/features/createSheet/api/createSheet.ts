import axiosInstance from "@/shared/api/axiosInstance";
import { UrlRequestDto } from "../types/createSheet.types";

export const createSheet = async (
  spaceId: number,
  data: UrlRequestDto
): Promise<void> => {
  await axiosInstance.post(`/api/v1/spaces/${spaceId}/songs/sheets`, data);
};
