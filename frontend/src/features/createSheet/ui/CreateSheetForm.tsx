import { Input } from "@/shared/ui/Input";
import { ItemField } from "@/shared/ui/ItemField";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface CreateSheetFormHandle {
  getYoutubeUrl: () => string;
}

export const CreateSheetForm = forwardRef<CreateSheetFormHandle>((_, ref) => {
  const [youtubeUrl, setYoutubeUrl] = useState("");

  useImperativeHandle(ref, () => ({
    getYoutubeUrl: () => youtubeUrl,
  }));

  return (
    <div className="flex flex-col gap-3">
      <ItemField
        icon="youtube_activity"
        title="Youtube Link"
        iconColor="red"
        required
      >
        <Input
          value={youtubeUrl}
          onChange={(val) => setYoutubeUrl(val)}
          placeholder="youtube 주소 (ex. https://www.youtube.com/watch?v=id)"
          maxLength={255}
          showCount={true}
        />
      </ItemField>
    </div>
  );
});
