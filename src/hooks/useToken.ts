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
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const { assets } = useChain(chain ?? env.CHAIN);
	return useQuery(
		["token", denomOrAddress, isNative],
		async () =>
			isNative
				? await getNativeAsset(denomOrAddress, env.RPC_URL, assets?.assets)
				: await getCw20Asset(
						// biome-ignore lint/style/noNonNullAssertion: Handled by enabled option
						cosmWasmClient!,
						denomOrAddress,
						env.IPFS_GATEWAY,
						assets?.assets,
						env.BECH32_PREFIX,
					),
		{
			staleTime: Number.POSITIVE_INFINITY,
			retryOnMount: false,
			retry: false,
			enabled: !!cosmWasmClient,
		},
	);
};
