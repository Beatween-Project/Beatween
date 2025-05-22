import { ResponseDto } from "@/shared/types/Response.types";
import { DeleteTeamSpaceParams } from "../types/deleteExitBand.types";
import { SpacePreDto } from "@/entities/band/types/Space.types";
import { deleteTeamSpace } from "../api/deleteExitBandApi";

export const removeTeamSpace = async (
  params: DeleteTeamSpaceParams
): Promise<ResponseDto<SpacePreDto[]>> => {
  try {
    return await deleteTeamSpace(params);
  } catch (err) {
    console.error("Failed to delete team space:", err);
    throw err;
  }
};
