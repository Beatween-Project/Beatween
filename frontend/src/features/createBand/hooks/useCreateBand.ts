import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { createBandService } from "../services/createBandService";
import { CreateBandRequest, CreateBandResponse } from "../types/createBand.types";

export const useCreateBand = (): UseMutationResult<
  CreateBandResponse,
  Error,
  CreateBandRequest
> => {
  return useMutation({
    mutationFn: createBandService,
  });
};
