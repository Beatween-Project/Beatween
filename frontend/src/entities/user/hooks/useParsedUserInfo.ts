import { useUserInfo } from "./useUserInfo";
import { useMemo } from "react";

export const useParsedUserInfo = () => {
  const { data, isLoading, error } = useUserInfo();

  const userInfo = useMemo(() => {
    const userData = data?.data;
    if (!userData) return null;

    return {
      name: userData.name,
      profileImageUrl: userData.profileImageUrl,
    };
  }, [data]);

  const spaces = useMemo(() => {
    return data?.data?.spaces ?? [];
  }, [data]);

  const categories = useMemo(() => {
    return data?.data?.categoriesAndSongsOfMySpace ?? [];
  }, [data]);

  return {
    userInfo,
    spaces,
    categories,
    isLoading,
    error,
  };
};
