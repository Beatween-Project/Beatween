import { ResponseDto } from "@/shared/types/Response.types";
import { SpaceDetailDto, SpacePreDto } from "../types/Space.types";
import axiosInstance from "@/shared/api/axiosInstance";

export const fetchSpaces = async (): Promise<ResponseDto<SpacePreDto[]>> => {
  const res = await axiosInstance.get<ResponseDto<SpacePreDto[]>>(
    `/api/v1/spaces/`
  );
  return res.data;
};

export const fetchSpaceDetail = async (
  spaceId: number
): Promise<ResponseDto<SpaceDetailDto>> => {
  const res = await axiosInstance.get<ResponseDto<SpaceDetailDto>>(
    `/api/v1/spaces/${spaceId}`
  );
  return res.data;
};
