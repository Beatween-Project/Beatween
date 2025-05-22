import { useMutation } from "@tanstack/react-query";
import { UrlRequestDto } from "../types/createSheet.types";
import { requestCreateSheet } from "../services/createSheetService";
import { toast } from "@/shared/lib/toast";
import { useSheetStore } from "../store/useSheetStore";

interface UseCreateSheetParams {
  spaceId: number;
}

export const useCreateSheet = ({ spaceId }: UseCreateSheetParams) => {
  const setCreating = useSheetStore((state) => state.setCreating);

  return useMutation({
    mutationFn: (data: UrlRequestDto) => requestCreateSheet(spaceId, data),
    onSuccess: () => {
      toast.success({
        title: "악보 생성 요청 성공",
        message:
          "서버로 악보 생성 요청을 보내는 데 성공했습니다. 곧 악보를 만들어서 전달 드릴게요. 잠시 기다려주세요.",
      });
    },
    onError: () => {
      toast.error({
        title: "악보 생성 실패",
        message: "링크가 올바른지 확인해주세요.",
      });
      setCreating(false);
    },
  });
};
