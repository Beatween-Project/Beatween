import { Result } from "@/shared/types/Response.types";
import { SignupDto } from "../types/signUp.types";
import { signupApi } from "../api/signUpApi";

export const signupService = async (
  data: SignupDto
): Promise<Result<string>> => {
  try {
    return await signupApi(data);
  } catch (err) {
    console.error("Failed to sign up", err);
    throw err;
  }
};
