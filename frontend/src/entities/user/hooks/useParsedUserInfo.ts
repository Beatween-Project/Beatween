import { useUserInfo } from "./useUserInfo";
import { useMemo } from "react";

export const useParsedUserInfo = () => {
  const { data, isLoading, error } = useUserInfo();

  const userInfo = useMemo(() => {
    if (!data?.data) return null;
    return {
      name: data.data.name,
      profileImageUrl: data.data.profileImageUrl,
    };
  }, [data]);

  const spaces = useMemo(() => {
    return data?.data.spaces || [];
  }, [data]);

  const categories = useMemo(() => {
    return data?.data.categoriesAndSongsOfMySpace || [];
  }, [data]);

  return {
    userInfo,
    spaces,
    categories,
    isLoading,
    error,
  };
};
