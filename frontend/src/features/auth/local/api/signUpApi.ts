import axiosInstance from "@/shared/api/axiosInstance";
import { SignupDto } from "../types/signUp.types";
import { Result } from "@/shared/types/Response.types";

export const signupApi = async (data: SignupDto): Promise<Result<string>> => {
  const res = await axiosInstance.post<Result<string>>(
    "/api/v1/users/signup",
    data
  );
  return res.data;
};
