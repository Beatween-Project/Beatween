import { updateProfileApi } from "../api/updateProfileApi";
import { ResponseDto } from "@/shared/types/Response.types";

export const updateProfile = async (
  formData: FormData
): Promise<ResponseDto<string>> => {
  try {
    return await updateProfileApi(formData);
  } catch (err) {
    console.error("프로필 수정 실패:", err);
    throw err;
  }
};
