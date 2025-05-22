import { ImageUploadCircle } from "@/shared/ui/ImageCircle";
import { Input } from "@/shared/ui/Input";
import { ItemField } from "@/shared/ui/ItemField";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { CopySongDto } from "../types/CopySong.types";
import { useCategoriesBySpace } from "@/entities/category/hooks/useCategories";
import { Select } from "@/shared/ui/Select";
import { useSpace } from "@/entities/band/hooks/useSpace";
import { ReplicateSongRequest } from "@/features/replicateSong/types/replicateSong.types";
import { usePersonalSpaceStore } from "@/entities/band/model/store";

export interface SongFormHandle {
  getFormData: () => FormData | ReplicateSongRequest;
}

interface SongFormProps {
  spaceId?: number;
  song?: CopySongDto;
  mode?: "update" | "replicate";
}

export const SongForm = forwardRef<SongFormHandle, SongFormProps>(
  ({ spaceId, song, mode }, ref) => {
    const personalSpaceId = usePersonalSpaceStore(
      (state) => state.personalSpaceId
    );

    const isReplicate = mode === "replicate";

    const [selectedSpaceId, setSelectedSpaceId] = useState<number | null>(
      isReplicate ? null : spaceId ?? null
    );

    const { data: spaceData } = useSpace();
    const { data: categoryData, isLoading } = useCategoriesBySpace(
      Number(selectedSpaceId)
    );

    const [noteName, setNoteName] = useState("");
    const [categoryId, setCategoryId] = useState(0);
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
      if (song) {
        setNoteName(song.title);
        setCategoryId(song.category_id);
      }
    }, [song]);

    useImperativeHandle(ref, () => ({
      getFormData() {
        if (isReplicate && selectedSpaceId && categoryId) {
          return {
            dest_space_id: selectedSpaceId,
            category_id: categoryId,
          };
        }

        const formData = new FormData();
        if (!isReplicate) {
          formData.append("songName", noteName);
        }
        if (isReplicate && selectedSpaceId) {
          formData.append("spaceId", String(selectedSpaceId));
        }

        formData.append(
          "categoryId",
          categoryId !== null ? String(categoryId) : ""
        );
        if (imageFile && !isReplicate) formData.append("thumbnail", imageFile);
        return formData;
      },
    }));

    if (categoryData && !categoryData.success)
      return (
        <div className="py-6 text-warning font-bold">
          상정 가능한 범위의 오류 발생: {categoryData.error?.message}
        </div>
      );

    return (
      <div className="flex flex-col gap-3">
        {isReplicate ? (
          <div className="self-center mb-2 text-brandcolor200 font-light">
            * 곡 이미지는 원본 곡의 이미지로 복제됩니다.
          </div>
        ) : (
          <div className="self-center mb-2">
            <ImageUploadCircle
              imageUrl={
                imageFile
                  ? URL.createObjectURL(imageFile)
                  : song?.thumbnail_url || undefined
              }
              alt="곡 이미지"
              onChange={setImageFile}
            />
          </div>
        )}
        {!isReplicate && (
          <ItemField icon="music_note" title="곡 이름" required>
            <Input
              value={noteName}
              onChange={setNoteName}
              placeholder="곡 이름 (ex. 박자로 채우는 우리 사이)"
              maxLength={20}
              showCount={true}
            />
          </ItemField>
        )}
        {isReplicate && (
          <ItemField icon="group" title="스페이스 선택" required>
            <Select
              value={selectedSpaceId ?? ""}
              onChange={(e) => setSelectedSpaceId(Number(e.target.value))}
              className="text-neutral1000 rounded-xl w-full"
            >
              <option value="">스페이스를 선택하세요</option>
              {spaceData?.data.map((space) => (
                <option key={space.space_id} value={space.space_id}>
                  {space.space_id === personalSpaceId
                    ? "MY MUSIC"
                    : space.space_name}
                </option>
              ))}
            </Select>
          </ItemField>
        )}

        <ItemField icon="folder" fill title="카테고리" required>
          <Select
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            disabled={isLoading || !selectedSpaceId}
            className="text-neutral1000 rounded-xl w-full"
          >
            <option value="">카테고리를 선택하세요</option>
            {categoryData?.data.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryId}>
                {cat.name}
              </option>
            ))}
          </Select>
        </ItemField>
      </div>
    );
  }
);
