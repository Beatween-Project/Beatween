import { ImageUploadCircle } from "@/shared/ui/ImageCircle";
import { Input } from "@/shared/ui/Input";
import { ItemField } from "@/shared/ui/ItemField";
import { TextArea } from "@/shared/ui/Textarea";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useSpaceVersionStore } from "../store/spaceVersionStore";

export interface BandFormHandle {
  getFormData: () => FormData;
}

interface BandFormProps {
  mode?: "create" | "update";
  spaceId?: number;
  initialData?: {
    spaceName?: string;
    description?: string;
    imageUrl?: string;
  };
  isMe?: boolean;
}

export const BandForm = forwardRef<BandFormHandle, BandFormProps>(
  ({ mode = "create", spaceId, initialData, isMe = false }, ref) => {
    const [bandName, setBandName] = useState(initialData?.spaceName ?? "");
    const [bandDetail, setBandDetail] = useState(
      initialData?.description ?? ""
    );
    const [imageFile, setImageFile] = useState<File | null>(null);

    const version = useSpaceVersionStore((state) =>
      spaceId ? state.getVersion(spaceId) : 0
    );

    const imageUrlWithVersion = initialData?.imageUrl
      ? `${initialData.imageUrl}?t=${version}`
      : undefined;

    useImperativeHandle(ref, () => ({
      getFormData() {
        const formData = new FormData();

        if (mode === "update") {
          formData.append("name", bandName);
          formData.append("description", bandDetail);
          if (imageFile) formData.append("image", imageFile);
        } else {
          formData.append("bandName", bandName);
          formData.append("bandDetail", bandDetail);
          if (imageFile) formData.append("bandImage", imageFile);
        }

        return formData;
      },
    }));

    return (
      <div className="flex flex-col gap-3">
        <div className="self-center mb-2">
          <ImageUploadCircle
            onChange={setImageFile}
            imageUrl={imageUrlWithVersion}
          />
        </div>
        {!isMe && (
          <ItemField icon="diversity_3" title="밴드 이름" required>
            <Input
              value={bandName}
              onChange={setBandName}
              placeholder="밴드 이름 (ex. 비트윈)"
              maxLength={20}
              showCount={true}
            />
          </ItemField>
        )}
        <ItemField icon="subject" title="밴드 설명" required>
          <TextArea
            value={bandDetail}
            onChange={setBandDetail}
            placeholder="밴드 설명 (ex. 음악에 진지한 직장인 밴드)"
          />
        </ItemField>
      </div>
    );
  }
);
