import { ResponseDto } from "@/shared/types/Response.types";
import { fetchInviteLink } from "../api/inviteApi";

export const getInviteLink = async (
  spaceId: number
): Promise<ResponseDto<string>> => {
  try {
    return await fetchInviteLink(spaceId);
  } catch (error) {
    console.error("🔗 Failed to fetch invite link:", error);
    throw error;
  }
};
