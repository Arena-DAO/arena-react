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

/**
 * Fetches a user profile from the PFPK service
 */
const fetchProfile = async (
	pfpk_url: string,
	address: string,
): Promise<Profile> => {
	if (!pfpk_url || !address) {
		return { address };
	}

	try {
		const endpoint = `/address/${address}`;
		const response = await fetch(pfpk_url + endpoint, {
			signal: AbortSignal.timeout(10000), // 10 second timeout
		});

		if (!response.ok) {
			console.warn(
				`Failed to fetch profile for ${address}: ${response.status}`,
			);
			return { address };
		}

		const data: FetchProfileResponse = await response.json();

		if ("error" in data) {
			console.warn(`Error in profile data for ${address}: ${data.error}`);
			return { address };
		}

		return {
			address,
			name: data.name ?? undefined,
			imageUrl: data.nft?.imageUrl
				? withIpfsSupport(data.nft.imageUrl)
				: undefined,
		};
	} catch (error) {
		console.error(`Exception fetching profile for ${address}:`, error);
		return { address };
	}
};

/**
 * Validates if a Discord image URL returns a valid image
 */
const isValidDiscordImage = async (imageUrl: string): Promise<boolean> => {
	if (!imageUrl) return false;

	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

		const response = await fetch(imageUrl, {
			method: "HEAD",
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			return false;
		}

		const contentType = response.headers.get("Content-Type");
		return contentType?.startsWith("image/") ?? false;
	} catch (error) {
		console.warn(`Failed to validate Discord image: ${imageUrl}`, error);
		return false;
	}
};

/**
 * Custom hook to fetch profile data for an address
 * @param address The wallet or DAO address to fetch profile for
 * @param isValid Whether the address is valid and should be queried
 */
export const useProfileData = (address: string, isValid = true) => {
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const { getCosmWasmClient: getMainnetCosmWasmClient } = useChain("neutron");

	return useQuery({
		queryKey: ["profile", address, env?.ENV],
		queryFn: async (): Promise<Profile> => {
			// Handle empty address
			if (!address) {
				throw new Error("Address is required");
			}

			// Validate client
			if (!cosmWasmClient) {
				throw new Error("CosmWasm client not initialized");
			}

			// Special case for competition enrollment
			if (address === env?.ARENA_COMPETITION_ENROLLMENT_ADDRESS) {
				return {
					address,
					name: "Competition Enrollment",
					imageUrl: "/logo.png",
				};
			}

			try {
				// Handle wallet addresses
				if (isValidWalletAddress(address)) {
					// Check Discord identity first
					if (env?.ARENA_DISCORD_IDENTITY_ADDRESS) {
						try {
							const mainnetClient = await getMainnetCosmWasmClient();

							if (mainnetClient) {
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
										imageUrl: isImageValid ? imageUrl : null,
										link: `https://discordapp.com/users/${user_id}`,
									};
								}
							}
						} catch (error) {
							console.error("Error fetching Discord profile:", error);
							// Fall through to PFPK lookup
						}
					}

					// Fallback to PFPK profile
					return await fetchProfile(env?.PFPK_URL || "", address);
				}

				// Handle DAO addresses
				try {
					const daoClient = new DaoDaoCoreQueryClient(cosmWasmClient, address);
					const config = await daoClient.config();

					return {
						address,
						name: config.name,
						imageUrl: config.image_url
							? withIpfsSupport(config.image_url)
							: null,
						link: env?.DAO_DAO_URL
							? `${env.DAO_DAO_URL}/dao/${address}`
							: undefined,
					};
				} catch (daoError) {
					console.error(`Error fetching DAO profile for ${address}:`, daoError);
					return { address };
				}
			} catch (error) {
				console.error(`Failed to fetch profile data for ${address}:`, error);
				return { address }; // Return minimal valid data with address only
			}
		},
		enabled: Boolean(address) && isValid && Boolean(cosmWasmClient),
		staleTime: Number.POSITIVE_INFINITY,
		cacheTime: 600000,
		retry: 1, // Only retry once
		refetchOnWindowFocus: false,
	});
};
