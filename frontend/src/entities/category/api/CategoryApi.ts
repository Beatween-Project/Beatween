import { ResponseDto } from "@/shared/types/Response.types";
import { CategoryDto } from "../types/Category.types";
import axiosInstance from "@/shared/api/axiosInstance";

export const fetchCategoriesBySpace = async (
  spaceId: number
): Promise<ResponseDto<CategoryDto[]>> => {
  const res = await axiosInstance.get<ResponseDto<CategoryDto[]>>(
    `/api/v1/spaces/${spaceId}/categories/`
  );
  return res.data;
};
