import { updateBandApi } from "../api/updateBandApi";
import { ResponseDto } from "@/shared/types/Response.types";
import { SpaceDetailResponseDto } from "../types/updateBand.types";

export const updateBand = async (
  spaceId: number,
  formData: FormData
): Promise<ResponseDto<SpaceDetailResponseDto>> => {
  try {
    return await updateBandApi(spaceId, formData);
  } catch (err) {
    console.error("밴드 수정 실패:", err);
    throw err;
  }
};
