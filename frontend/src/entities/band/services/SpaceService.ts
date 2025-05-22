import { ResponseDto } from "@/shared/types/Response.types";
import { SpacePreDto } from "../types/Space.types";
import { fetchSpaces } from "../api/SpaceApi";

export const getSpaces = async (): Promise<ResponseDto<SpacePreDto[]>> => {
  try {
    return await fetchSpaces();
  } catch (err) {
    console.error("Failed to get spaces", err);
    throw err;
  }
};
