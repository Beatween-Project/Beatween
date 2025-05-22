import { CategoryDto } from "@/entities/category/types/Category.types";
import axiosInstance from "@/shared/api/axiosInstance";
import { ResponseDto } from "@/shared/types/Response.types";

export const updateCategoryApi = async (
  spaceId: number,
  categoryId: number,
  name: string
): Promise<ResponseDto<CategoryDto>> => {
  const res = await axiosInstance.patch<ResponseDto<CategoryDto>>(
    `/api/v1/spaces/${spaceId}/categories/${categoryId}`,
    null, // 바디 없음
    {
      params: {
        name,
      },
    }
  );
  return res.data;
};

export const createCategoryApi = async (
  spaceId: number,
  name: string
): Promise<ResponseDto<CategoryDto>> => {
  const res = await axiosInstance.post<ResponseDto<CategoryDto>>(
    `/api/v1/spaces/${spaceId}/categories/`,
    null,
    {
      params: { name },
    }
  );
  return res.data;
};

export const deleteCategory = async (
  spaceId: number,
  categoryId: number
): Promise<ResponseDto<string>> => {
  const res = await axiosInstance.delete<ResponseDto<string>>(
    `/api/v1/spaces/${spaceId}/categories/${categoryId}`
  );
  return res.data;
};
