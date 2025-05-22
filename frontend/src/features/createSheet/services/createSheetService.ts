import { UrlRequestDto } from "../types/createSheet.types";
import { createSheet } from "../api/createSheet";

export const requestCreateSheet = async (
  spaceId: number,
  data: UrlRequestDto
): Promise<void> => {
  try {
    await createSheet(spaceId, data);
  } catch (err) {
    console.error("악보 생성 실패:", err);
    throw err;
  }
};
