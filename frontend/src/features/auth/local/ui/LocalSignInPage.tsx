import { useSearchParams } from "react-router-dom";
import { useLogin } from "../hooks/useSignIn";
import { LoginDto } from "../types/signIn.types";
import { LocalSignForm } from "./LocalSignForm";

export const LocalSignInPage = () => {
  const loginMutation = useLogin();
  const [searchParams] = useSearchParams();

  const slug = searchParams.get("slug") || undefined;
  const shareKey = searchParams.get("shareKey") || undefined;

  const handleSignIn = (data: { email: string; password: string }) => {
    const loginDto: LoginDto = {
      email: data.email,
      password: data.password,
    };

    loginMutation.mutate({ loginDto, slug, shareKey });
  };

  return <LocalSignForm mode="signin" onSubmit={handleSignIn} />;
};
