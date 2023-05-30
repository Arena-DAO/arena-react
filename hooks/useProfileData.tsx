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
  const apiPrefix = process.env.NEXT_PUBLIC_PFPK;
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

export const useProfileData = (address: string) => {
  return useQuery(["profile", address], () => fetchProfile(address), {
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
