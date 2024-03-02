import { Asset } from "@chain-registry/types";
import { CardProps } from "@chakra-ui/card";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useChain } from "@cosmos-kit/react";
import { useEffect, useState } from "react";
import env from "~/config/env";
import { getCw20Asset } from "~/helpers/TokenHelpers";
import { AssetCard } from "./AssetCard";

interface Cw20CardProps extends CardProps {
	cosmwasmClient: CosmWasmClient;
	address: string;
	amount: string;
	deleteFn?: (index: number) => void;
	index?: number;
}

export function Cw20Card({
	cosmwasmClient,
	address,
	amount,
	deleteFn,
	index = 0,
	...cardProps
}: Cw20CardProps) {
	const { assets } = useChain(env.CHAIN);
	const [asset, setAsset] = useState<Asset>();

	useEffect(() => {
		if (assets)
			getCw20Asset(address, cosmwasmClient, assets.assets).then(
				(asset) => {
					setAsset(asset);
				},
				(_x) => setAsset(undefined),
			);
	}, [assets, cosmwasmClient, address]);

	if (!asset) return null;
	return (
		<AssetCard
			asset={asset}
			amount={amount}
			deleteFn={deleteFn}
			index={index}
			{...cardProps}
		/>
	);
}
