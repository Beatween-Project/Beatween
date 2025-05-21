import { Result } from "@/shared/types/Response.types";
import { LoginDto } from "../types/signIn.types";
import axiosInstance from "@/shared/api/axiosInstance";

export const loginApi = async (
  data: LoginDto
): Promise<Result<{ token: string }>> => {
  const res = await axiosInstance.post<Result<{ token: string }>>(
    "/api/v1/users/login",
    data
  );
  return res.data;
};
