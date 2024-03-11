import type { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";

export type WithClient<T> = T & {
	cosmWasmClient: CosmWasmClient;
};
