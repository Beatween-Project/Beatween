import { ResponseDto } from "@/shared/types/Response.types";
import { useQuery } from "@tanstack/react-query";
import { CategoryDto } from "../types/Category.types";
import { getCategoriesBySpace } from "../services/CategoryService";

export const useCategoriesBySpace = (spaceId: number) => {
  return useQuery<ResponseDto<CategoryDto[]>, Error>({
    queryKey: ["categories", spaceId],
    queryFn: () => getCategoriesBySpace(spaceId!),
    enabled: !!spaceId,
  });
};
