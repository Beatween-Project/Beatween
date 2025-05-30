import { useSearchParams } from "react-router-dom";
import { useSignup } from "../hooks/useSignUp";
import { SignupDto } from "../types/signUp.types";
import { LocalSignForm } from "./LocalSignForm";

export const LocalSignUpPage = () => {
  const signupMutation = useSignup();
  const [searchParams] = useSearchParams();

  const slug = searchParams.get("slug") || undefined;
  const shareKey = searchParams.get("shareKey") || undefined;

  const handleSignUp = (data: {
    email: string;
    password: string;
    nickname?: string;
  }) => {
    const signupDto: SignupDto = {
      email: data.email,
      password: data.password,
      nickname: data.nickname ?? "",
    };

    signupMutation.mutate({ signupDto, slug, shareKey });
  };

  return <LocalSignForm mode="signup" onSubmit={handleSignUp} />;
};
