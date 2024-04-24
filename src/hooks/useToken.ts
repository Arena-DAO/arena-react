import type { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useChain } from "@cosmos-kit/react";
import { useQuery } from "@tanstack/react-query";
import { getCw20Asset, getNativeAsset } from "~/helpers/TokenHelpers";
import { useEnv } from "./useEnv";

export const useToken = (
	cosmWasmClient: CosmWasmClient,
	denomOrAddress: string,
	isNative = true,
	chain?: string,
) => {
	const { data: env } = useEnv();
	const { assets } = useChain(chain ?? env.CHAIN);
	return useQuery(
		["token", denomOrAddress, isNative],
		async () =>
			isNative
				? await getNativeAsset(denomOrAddress, env.RPC_URL, assets?.assets)
				: await getCw20Asset(
						cosmWasmClient,
						denomOrAddress,
						env.IPFS_GATEWAY,
						assets?.assets,
						env.BECH32_PREFIX,
					),
		{
			staleTime: Number.POSITIVE_INFINITY,
			retryOnMount: false,
			retry: false,
		},
	);
};
