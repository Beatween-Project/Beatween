import { Result } from "@/shared/types/Response.types";
import { loginApi } from "../api/signInApi";
import { LoginDto } from "../types/signIn.types";

export const loginService = async (
  data: LoginDto
): Promise<Result<{ token: string }>> => {
  try {
    return await loginApi(data);
  } catch (err) {
    console.error("Failed to login", err);
    throw err;
  }
};
