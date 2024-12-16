import { useQuery } from "@tanstack/react-query";
import { DaoDaoCoreQueryClient } from "~/codegen/DaoDaoCore.client";
import { isValidWalletAddress } from "~/helpers/AddressHelpers";
import { withIpfsSupport } from "~/helpers/IPFSHelpers";
import { useCosmWasmClient } from "./useCosmWamClient";
import { useEnv } from "./useEnv";
import { ArenaDiscordIdentityQueryClient } from "~/codegen/ArenaDiscordIdentity.client";

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
	imageUrl?: string | null;
	discordId?: string;
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

	return useQuery({
		queryKey: ["profile", address],
		queryFn: async (): Promise<Profile> => {
			if (!cosmWasmClient) {
				throw "Query must block on loading CosmWasm client";
			}

			// First check Discord identity
			if (env.ARENA_DISCORD_IDENTITY_ADDRESS) {
				const identityClient = new ArenaDiscordIdentityQueryClient(
					cosmWasmClient,
					env.ARENA_DISCORD_IDENTITY_ADDRESS,
				);
				const discordUserId = await identityClient.userId({ addr: address });

				if (discordUserId) {
					return {
						address,
						discordId: discordUserId,
					};
				}
			}

			// If no Discord ID found, get the appropriate profile
			if (isEnrollmentContract) {
				return {
					address,
					name: "Competition Enrollment",
					imageUrl: "/logo.svg",
				};
			}

			if (isWallet) {
				return await fetchProfile(env.PFPK_URL, address);
			}

			// Must be a DAO
			const daoClient = new DaoDaoCoreQueryClient(cosmWasmClient, address);
			const config = await daoClient.config();

			return {
				address,
				name: config.name,
				imageUrl: withIpfsSupport(config.image_url),
			};
		},
		enabled: isValid && !!cosmWasmClient,
	});
};
