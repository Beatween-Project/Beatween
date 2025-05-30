import { useMutation } from "@tanstack/react-query";
import { loginService } from "../services/signInService";
import { LoginDto } from "../types/signIn.types";
import { Result } from "@/shared/types/Response.types";
import { toast } from "@/shared/lib/toast";
import { useGlobalStore } from "@/app/store/globalStore";

export const useLogin = () => {
  const login = useGlobalStore((state) => state.login);

  return useMutation({
    mutationFn: (data: LoginDto) => loginService(data),
    onSuccess: (data: Result<{ accessToken: string }>) => {
      if (data.success) {
        const token = data.data?.accessToken;
        if (token) {
          login(token);
        }
      } else {
        toast.error({
          title: "로그인 실패",
          message:
            data.error?.message ?? "이메일 또는 비밀번호를 확인해주세요.",
        });
      }
    },
    onError: () => {
      toast.error({
        title: "로그인 실패",
        message: "서버와의 통신 중 문제가 발생했습니다. 다시 시도해주세요.",
      });
    },
  });
};
