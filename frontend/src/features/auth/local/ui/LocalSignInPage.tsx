import { useLogin } from "../hooks/useSignIn";
import { LoginDto } from "../types/signIn.types";
import { LocalSignForm } from "./LocalSignForm";

export const LocalSignInPage = () => {
  const loginMutation = useLogin();

  const handleSignIn = (data: { email: string; password: string }) => {
    const loginDto: LoginDto = {
      email: data.email,
      password: data.password,
    };

    loginMutation.mutate(loginDto);
  };

  return <LocalSignForm mode="signin" onSubmit={handleSignIn} />;
};
