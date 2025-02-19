import { useChain } from "@cosmos-kit/react";
import { useQuery } from "@tanstack/react-query";
import { getCw20Asset, getNativeAsset } from "~/helpers/TokenHelpers";
import { useCosmWasmClient } from "./useCosmWamClient";
import { useEnv } from "./useEnv";

export const useToken = (
	denomOrAddress: string,
	isNative = true,
	chain?: string,
) => {
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const chainId = chain ?? env?.CHAIN;
	const { assets } = useChain(chainId);

	return useQuery(
		["token", denomOrAddress, isNative, chainId],
		async () => {
			if (!denomOrAddress) {
				throw new Error("Token denom or address is required");
			}

			try {
				if (isNative) {
					return await getNativeAsset(
						denomOrAddress,
						env.RPC_URL,
						assets?.assets,
					);
				}
				if (!cosmWasmClient) {
					throw new Error("CosmWasm client not initialized");
				}

				return await getCw20Asset(
					cosmWasmClient,
					denomOrAddress,
					assets?.assets,
					env.BECH32_PREFIX,
				);
			} catch (error) {
				console.error(
					`Failed to fetch token data for ${denomOrAddress}:`,
					error,
				);
				throw error;
			}
		},
		{
			staleTime: Number.POSITIVE_INFINITY,
			cacheTime: 600000,
			retryOnMount: false,
			retry: false,
			enabled:
				Boolean(cosmWasmClient) &&
				Boolean(denomOrAddress) &&
				denomOrAddress.length > 0,
			onError: (error) => {
				console.warn(`Token query failed for ${denomOrAddress}:`, error);
			},
		},
	);
};
