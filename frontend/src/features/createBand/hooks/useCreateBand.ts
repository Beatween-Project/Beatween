import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { createBandService } from "../services/createBandService";
import {
  CreateBandRequest,
  CreateBandResponse,
} from "../types/createBand.types";

export const useCreateBand = (): UseMutationResult<
  CreateBandResponse,
  Error,
  CreateBandRequest
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBandService,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["spaces"],
      });
    },
  });
};
