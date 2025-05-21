import { useGlobalStore } from "@/app/store/globalStore";
import { EventSourcePolyfill } from "event-source-polyfill";

export const subscribeSheetStatus = (spaceId: number): EventSource => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = useGlobalStore.getState().accessToken;
  if (!token) throw new Error("No access token available");

  const url = `${baseUrl}/api/v1/spaces/${spaceId}/songs/sheets/subscribe`;
  return new EventSourcePolyfill(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
};
