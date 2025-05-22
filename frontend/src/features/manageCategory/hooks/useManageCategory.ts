import { CategoryDto } from "@/entities/category/types/Category.types";
import { ResponseDto } from "@/shared/types/Response.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  removeCategory,
  updateCategory,
} from "../services/manageCategoryService";

export const useCreateCategory = (spaceId: number) => {
  const queryClient = useQueryClient();
  return useMutation<ResponseDto<CategoryDto>, Error, string>({
    mutationFn: (name: string) => createCategory(spaceId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", spaceId] });
      queryClient.invalidateQueries({ queryKey: ["copySong", spaceId] });
    },
  });
};

export const useUpdateCategory = (spaceId: number) => {
  const queryClient = useQueryClient();
  return useMutation<
    ResponseDto<CategoryDto>,
    Error,
    { categoryId: number; name: string }
  >({
    mutationFn: ({ categoryId, name }) =>
      updateCategory(spaceId, categoryId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", spaceId] });
      queryClient.invalidateQueries({ queryKey: ["copySong", spaceId] });
    },
  });
};

export const useDeleteCategory = (spaceId: number) => {
  const queryClient = useQueryClient();
  return useMutation<ResponseDto<string>, Error, number>({
    mutationFn: (categoryId: number) => removeCategory(spaceId, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", spaceId] });
      queryClient.invalidateQueries({ queryKey: ["copySong", spaceId] });
    },
  });
};
