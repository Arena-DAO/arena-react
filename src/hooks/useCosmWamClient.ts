import { useChain } from "@cosmos-kit/react";
import { useQuery } from "@tanstack/react-query";
import { useEnv } from "./useEnv";

export const useCosmWasmClient = (chain?: string) => {
	const { data: env } = useEnv();
	const { getCosmWasmClient } = useChain(chain ?? env.CHAIN);
	return useQuery(["cosmWasmClient"], async () => await getCosmWasmClient());
};
