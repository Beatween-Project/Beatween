import { fetchCategoriesBySpace } from "../api/CategoryApi";
import { CategoryDto } from "../types/Category.types";
import { ResponseDto } from "@/shared/types/Response.types";

export const getCategoriesBySpace = async (
  spaceId: number
): Promise<ResponseDto<CategoryDto[]>> => {
  try {
    return await fetchCategoriesBySpace(spaceId);
  } catch (err) {
    console.error("Failed to get categories", err);
    throw err;
  }
};
