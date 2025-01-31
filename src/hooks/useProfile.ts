import { useChain } from "@cosmos-kit/react";
import { useQuery } from "@tanstack/react-query";
import { ArenaDiscordIdentityQueryClient } from "~/codegen/ArenaDiscordIdentity.client";
import { DaoDaoCoreQueryClient } from "~/codegen/DaoDaoCore.client";
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

export type Profile = {
	address: string;
	name?: string;
	imageUrl?: string | null;
	discordId?: string;
	link?: string;
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

const isValidDiscordImage = async (imageUrl: string): Promise<boolean> => {
	try {
		const response = await fetch(imageUrl, { method: "HEAD" }); // Use HEAD to avoid downloading the full image
		if (!response.ok) {
			return false; // The request failed
		}
		const contentType = response.headers.get("Content-Type");
		// Check if the content type indicates an image
		return contentType?.startsWith("image/") ?? false;
	} catch (error) {
		return false; // Assume invalid if any error occurs
	}
};

export const useProfileData = (address: string, isValid: boolean) => {
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const { getCosmWasmClient } = useChain("neutron");

	return useQuery({
		queryKey: ["profile", address],
		queryFn: async (): Promise<Profile> => {
			if (!cosmWasmClient) {
				throw "Query must block on loading CosmWasm client";
			}

			if (address === env.ARENA_COMPETITION_ENROLLMENT_ADDRESS) {
				return {
					address,
					name: "Competition Enrollment",
					imageUrl: "/logo.png",
				};
			}

			if (isValidWalletAddress(address)) {
				// Check Discord identity
				if (env.ARENA_DISCORD_IDENTITY_ADDRESS) {
					const mainnetClient =
						env.ENV === "production"
							? cosmWasmClient
							: await getCosmWasmClient();
					const identityClient = new ArenaDiscordIdentityQueryClient(
						mainnetClient,
						env.ARENA_DISCORD_IDENTITY_ADDRESS,
					);
					const discordProfile = await identityClient.discordProfile({
						addr: address,
					});

					if (discordProfile) {
						const { user_id, username, avatar_hash } = discordProfile;

						const imageUrl = avatar_hash
							? `https://cdn.discordapp.com/avatars/${user_id}/${avatar_hash}.png`
							: null;

						const isImageValid = imageUrl
							? await isValidDiscordImage(imageUrl)
							: false;

						return {
							address,
							discordId: user_id,
							name: username,
							imageUrl: isImageValid ? imageUrl : null, // Use only if valid
							link: `https://discordapp.com/users/${user_id}`,
						};
					}
				}

				return await fetchProfile(env.PFPK_URL, address);
			}

			// Must be a DAO
			const daoClient = new DaoDaoCoreQueryClient(cosmWasmClient, address);
			const config = await daoClient.config();

			return {
				address,
				name: config.name,
				imageUrl: withIpfsSupport(config.image_url),
				link: `${env.DAO_DAO_URL}/dao/${address}`,
			};
		},
		enabled: isValid && !!cosmWasmClient,
		staleTime: Number.POSITIVE_INFINITY,
		cacheTime: 600000,
	});
};
