import { useCategoriesBySpace } from "@/entities/category/hooks/useCategories";
import { LineBasic } from "@/shared/ui/LineBasic";
import { forwardRef, useImperativeHandle, useState } from "react";
import {
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "../hooks/useManageCategory";
import { toast } from "@/shared/lib/toast";

export interface ManageCategoryFormHandles {
  addCreateLine: () => void;
}

interface ManageCategoryFormProps {
  spaceId: number;
}

export const ManageCategoryForm = forwardRef<
  ManageCategoryFormHandles,
  ManageCategoryFormProps
>(({ spaceId }, ref) => {
  const { data, isLoading, isError } = useCategoriesBySpace(spaceId);

  const { mutate: createCategory } = useCreateCategory(spaceId);
  const { mutate: updateCategory } = useUpdateCategory(spaceId);
  const { mutate: deleteCategory } = useDeleteCategory(spaceId);

  const [createLines, setCreateLines] = useState<number[]>([]);

  useImperativeHandle(ref, () => ({
    addCreateLine: () => {
      setCreateLines((prev) => [...prev, Date.now()]);
    },
  }));

  const handleCreate = (name: string, lineId: number) => {
    if (!name.trim()) {
      toast.warning({
        title: "입력 내용 없음",
        message: "최소 1자 이상 작성해주세요.",
      });
      return;
    }

    if (name.trim() === "기본") {
      toast.warning({
        title: "사용 불가 이름",
        message: "'기본'은 사용할 수 없는 이름입니다.",
      });
      return;
    }

    createCategory(name, {
      onSuccess: () => {
        toast.success({
          title: "카테고리 생성 완료",
          message: "새로운 카테고리를 생성하였습니다.",
        });
        setCreateLines((prev) => prev.filter((id) => id !== lineId));
      },
      onError: () => {
        toast.error({
          title: "카테고리 생성 실패",
          message: "카테고리를 만들지 못했습니다. 다시 시도해주세요.",
        });
      },
    });
  };

  const handleUpdate = (categoryId: number, name: string) => {
    if (!name.trim()) {
      toast.warning({
        title: "입력 내용 없음",
        message: "최소 1자 이상 작성해주세요.",
      });
      return;
    }

    if (name.trim() === "기본") {
      toast.warning({
        title: "사용 불가 이름",
        message: "'기본'은 사용할 수 없는 이름입니다.",
      });
      return;
    }

    updateCategory(
      { categoryId, name },
      {
        onSuccess: () => {
          toast.success({
            title: "카테고리 수정 완료",
            message: "카테고리의 제목이 수정되었습니다.",
          });
        },
        onError: () => {
          toast.error({
            title: "카테고리 수정 실패",
            message:
              "카테고리의 제목을 수정하지 못했습니다. 다시 시도해주세요.",
          });
        },
      }
    );
  };

  const handleDelete = (categoryId: number) => {
    deleteCategory(categoryId, {
      onSuccess: () => {
        toast.success({
          title: "카테고리 삭제 완료",
          message: "카테고리와 카테고리 안에 있는 곡들이 모두 삭제되었습니다.",
        });
      },
      onError: () => {
        toast.error({
          title: "카테고리 삭제 실패",
          message: "카테고리를 삭제하지 못했습니다. 다시 시도해주세요.",
        });
      },
    });
  };

  if (isLoading) return <div>Loading categories...</div>;
  if (isError || !data?.success) return <div>Failed to load categories.</div>;

  return (
    <div>
      {data.data.map((category) => (
        <LineBasic
          key={category.categoryId}
          text={category.name}
          editable={category.name !== "기본"}
          onUpdate={(name) => handleUpdate(category.categoryId, name)}
          onDelete={() => handleDelete(category.categoryId)}
        />
      ))}

      {createLines.map((lineId) => (
        <LineBasic
          key={lineId}
          mode="create"
          onCreate={(value) => handleCreate(value, lineId)}
          onCreateCancel={() =>
            setCreateLines((prev) => prev.filter((id) => id !== lineId))
          }
        />
      ))}
    </div>
  );
});
