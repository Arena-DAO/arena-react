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

	return useQuery(["token", denomOrAddress], async () =>
		isNative
			? await getNativeAsset(denomOrAddress, env.JUNO_API_URL, assets?.assets)
			: await getCw20Asset(
					cosmWasmClient,
					denomOrAddress,
					assets?.assets,
					env.BECH32_PREFIX,
			  ),
	);
};
