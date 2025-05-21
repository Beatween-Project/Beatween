import { createBandApi } from "../api/createBandApi";
import { CreateBandRequest, CreateBandResponse } from "../types/createBand.types";

export const createBandService = async (
  data: CreateBandRequest
): Promise<CreateBandResponse> => {
  return await createBandApi(data);
};
