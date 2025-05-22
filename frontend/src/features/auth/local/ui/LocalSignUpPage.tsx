import { useSignup } from "../hooks/useSignUp";
import { SignupDto } from "../types/signUp.types";
import { LocalSignForm } from "./LocalSignForm";

export const LocalSignUpPage = () => {
  const signupMutation = useSignup();

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

    signupMutation.mutate(signupDto);
  };

  return <LocalSignForm mode="signup" onSubmit={handleSignUp} />;
};
