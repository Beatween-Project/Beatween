import { useMutation } from "@tanstack/react-query";
import { toast } from "@/shared/lib/toast";
import { Result } from "@/shared/types/Response.types";
import { SignupDto } from "../types/signUp.types";
import { signupService } from "../services/signUpService";
import { useNavigate } from "react-router-dom";

export const useSignup = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: SignupDto) => signupService(data),
    onSuccess: (data: Result<string>) => {
      if (data.success) {
        toast.success({
          title: "회원가입 성공",
          message:
            "계정이 성공적으로 생성되었습니다. 이제 로그인하실 수 있어요!",
        });

        navigate("/signin");
      } else {
        toast.error({
          title: "회원가입 실패",
          message:
            data.error?.message ?? "잘못된 요청입니다. 다시 시도해주세요.",
        });
      }
    },
    onError: () => {
      toast.error({
        title: "회원가입 실패",
        message: "서버와의 통신 중 문제가 발생했습니다. 다시 시도해주세요.",
      });
    },
  });
};
