import { useQuery } from "@tanstack/react-query";
import { DaoDaoCoreQueryClient } from "~/codegen/DaoDaoCore.client";
import { useDaoDaoCoreConfigQuery } from "~/codegen/DaoDaoCore.react-query";
import { isValidWalletAddress } from "~/helpers/AddressHelpers";
import { withIpfsSupport } from "~/helpers/IPFSHelpers";
import { useCosmWasmClient } from "./useCosmWamClient";
import { useEnv } from "./useEnv";

type UserProfile = {
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

type Profile = {
	address: string;
	name?: string;
	imageUrl?: string;
};

type FetchProfileResponse = UserProfile | ErrorResponse;

const fetchProfile = async (
	pfpk_url: string,
	address: string,
): Promise<Profile> => {
	const endpoint = `/address/${address}`;
	const response = await fetch(pfpk_url + endpoint);

	if (!response.ok) {
		return { address };
	}

	const data: FetchProfileResponse = await response.json();

	if ("error" in data) {
		return { address };
	}

	return {
		address,
		name: data.name ?? undefined,
		imageUrl: data.nft?.imageUrl,
	};
};

export const useProfileData = (address: string, isValid: boolean) => {
	const isWallet = isValidWalletAddress(address);

	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const isEnrollmentContract = isWallet
		? false
		: address === env.ARENA_COMPETITION_ENROLLMENT_ADDRESS;

	const walletQuery = useQuery(
		["profile", address],
		async () => await fetchProfile(env.PFPK_URL, address),
		{
			staleTime: Number.POSITIVE_INFINITY,
			enabled: isWallet && isValid,
			select: (data) => {
				return {
					address,
					name: data.name,
					imageUrl: withIpfsSupport(env.IPFS_GATEWAY, data.imageUrl),
				} as Profile;
			},
		},
	);
	const daoQuery = useDaoDaoCoreConfigQuery({
		client:
			cosmWasmClient && new DaoDaoCoreQueryClient(cosmWasmClient, address),
		options: {
			staleTime: Number.POSITIVE_INFINITY,
			enabled: !isWallet && isValid && !isEnrollmentContract,
			select: (data) => {
				return {
					address,
					name: data.name,
					imageUrl: withIpfsSupport(env.IPFS_GATEWAY, data.image_url),
				} as Profile;
			},
		},
	});
	const enrollmentQuery = useQuery(
		["profile", address],
		() => {
			return { address, name: "Competition Enrollment", imageUrl: "/logo.svg" };
		},
		{
			staleTime: Number.POSITIVE_INFINITY,
			enabled: isEnrollmentContract,
		},
	);

	return isWallet
		? walletQuery
		: isEnrollmentContract
			? enrollmentQuery
			: daoQuery;
};
