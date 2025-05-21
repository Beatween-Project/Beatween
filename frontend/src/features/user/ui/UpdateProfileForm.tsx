import { forwardRef, useImperativeHandle, useState } from "react";
import { ImageUploadCircle } from "@/shared/ui/ImageCircle";
import { Input } from "@/shared/ui/Input";
import { ItemField } from "@/shared/ui/ItemField";
import { useParsedUserInfo } from "@/entities/user/hooks/useParsedUserInfo";

export type UpdateProfileRef = {
  getFormData: () => FormData;
};

export const UpdateProfileForm = forwardRef<UpdateProfileRef>((_, ref) => {
  const { userInfo } = useParsedUserInfo();

  const [nickname, setNickname] = useState(userInfo?.name ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useImperativeHandle(ref, () => ({
    getFormData: () => {
      const formData = new FormData();
      formData.append("nickName", nickname);
      if (imageFile) {
        formData.append("image", imageFile);
      }
      return formData;
    },
  }));

  return (
    <div className="flex flex-col gap-3">
      <div className="self-center mb-2">
        <ImageUploadCircle
          onChange={setImageFile}
          imageUrl={userInfo?.profileImageUrl}
        />
      </div>
      <ItemField icon="person" fill title="닉네임" required>
        <Input
          value={nickname}
          onChange={setNickname}
          placeholder="닉네임"
          maxLength={20}
          showCount={true}
        />
      </ItemField>
      <ItemField variant="row" icon="alternate_email" title="이메일">
        email@email.com
      </ItemField>
    </div>
  );
});
