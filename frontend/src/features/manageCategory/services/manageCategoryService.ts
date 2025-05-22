import { CategoryDto } from "@/entities/category/types/Category.types";
import { ResponseDto } from "@/shared/types/Response.types";
import {
  createCategoryApi,
  deleteCategory,
  updateCategoryApi,
} from "../api/manageCategoryApi";

export const createCategory = async (
  spaceId: number,
  name: string
): Promise<ResponseDto<CategoryDto>> => {
  try {
    return await createCategoryApi(spaceId, name);
  } catch (err) {
    console.error("Failed to create category", err);
    throw err;
  }
};

export const updateCategory = async (
  spaceId: number,
  categoryId: number,
  name: string
): Promise<ResponseDto<CategoryDto>> => {
  try {
    return await updateCategoryApi(spaceId, categoryId, name);
  } catch (err) {
    console.error("Failed to update category", err);
    throw err;
  }
};

export const removeCategory = async (
  spaceId: number,
  categoryId: number
): Promise<ResponseDto<string>> => {
  try {
    return await deleteCategory(spaceId, categoryId);
  } catch (err) {
    console.error("Failed to delete category", err);
    throw err;
  }
};
