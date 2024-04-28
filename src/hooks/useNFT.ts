import type { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useQuery } from "@tanstack/react-query";
import { getNFT } from "~/helpers/NFTHelpers";

export const useNFT = (
	cosmWasmClient: CosmWasmClient,
	address: string,
	tokenId: string,
) => {
	return useQuery(
		["nft", address, tokenId],
		async () => await getNFT(cosmWasmClient, address, tokenId),
		{
			staleTime: Number.POSITIVE_INFINITY,
			retryOnMount: false,
			retry: false,
		},
	);
};
