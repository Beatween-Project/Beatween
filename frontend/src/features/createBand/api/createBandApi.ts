import axiosInstance from "@/shared/api/axiosInstance";
import {
  CreateBandRequest,
  CreateBandResponse,
} from "../types/createBand.types";

export const createBandApi = async (
  data: CreateBandRequest
): Promise<CreateBandResponse> => {
  const formData = new FormData();
  formData.append("name", data.name);
  if (data.description) formData.append("description", data.description);
  if (data.image) formData.append("image", data.image); // optional

  const headers = {
    "X-USER-ID": "1", // ✅ 임시 유저 ID
    // ✅ Content-Type 생략 (브라우저가 multipart 설정함)
  };

  const response = await axiosInstance.post<CreateBandResponse>(
    "/api/v1/spaces",
    formData,
    { headers }
  );

  return response.data;
};
