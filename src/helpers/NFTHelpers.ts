import type { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Cw721BaseQueryClient } from "~/codegen/Cw721Base.client";

export async function getNFT(
	cosmWasmClient: CosmWasmClient,
	address: string,
	tokenId: string,
) {
	const client = new Cw721BaseQueryClient(cosmWasmClient, address);
	return await client.nftInfo({ tokenId });
}
