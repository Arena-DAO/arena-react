import env from "@config/env";
import { useQuery } from "@tanstack/react-query";

type ProfileData = {
  nonce: number;
  name: string | null;
  nft: {
    chainId: string;
    collectionAddress: string;
    tokenId: string;
    imageUrl: string;
  } | null;
};

type ErrorResponse = {
  error: string;
  message: string;
};

type FetchProfileResponse = ProfileData | ErrorResponse;

const fetchProfile = async (address: string): Promise<ProfileData> => {
  const apiPrefix = env.PFPK_URL;
  const endpoint = `/address/${address}`;
  const response = await fetch(apiPrefix + endpoint);

  if (!response.ok) {
    throw new Error("Error fetching profile");
  }

  const data: FetchProfileResponse = await response.json();

  if ("error" in data) {
    throw new Error(data.message);
  }

  return data;
};

export const useProfileData = (address: string, enabled: boolean = true) => {
  return useQuery(["profile", address], () => fetchProfile(address), {
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled,
  });
};
