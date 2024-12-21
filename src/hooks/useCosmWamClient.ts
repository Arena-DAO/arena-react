import { useChain } from "@cosmos-kit/react";
import { useQuery } from "@tanstack/react-query";
import { useEnv } from "./useEnv";

export const useCosmWasmClient = () => {
	const env = useEnv();
	const { getCosmWasmClient } = useChain(env.CHAIN);
	return useQuery(["cosmWasmClient"], async () => await getCosmWasmClient(), {
		staleTime: Number.POSITIVE_INFINITY,
		cacheTime: Number.POSITIVE_INFINITY,
	});
};
