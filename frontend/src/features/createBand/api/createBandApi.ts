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

  const response = await axiosInstance.post<CreateBandResponse>(
    "/api/v1/spaces",
    formData
  );

  return response.data;
};
