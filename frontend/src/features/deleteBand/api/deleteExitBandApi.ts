import axiosInstance from "@/shared/api/axiosInstance";
import type { ResponseDto } from "@/shared/types/Response.types";
import { DeleteTeamSpaceParams } from "../types/deleteExitBand.types";

export const deleteTeamSpace = async ({
  spaceId,
}: DeleteTeamSpaceParams): Promise<ResponseDto<any>> => {
  const res = await axiosInstance.delete<ResponseDto<any>>(
    `/api/v1/spaces/teams/${spaceId}`
  );
  return res.data;
};
