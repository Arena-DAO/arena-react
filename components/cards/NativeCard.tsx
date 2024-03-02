import { Asset } from "@chain-registry/types";
import { CardProps } from "@chakra-ui/card";
import { useChain } from "@cosmos-kit/react";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { useEffect, useState } from "react";
import env from "~/config/env";
import { getCoinAsset, getDisplayCoin } from "~/helpers/TokenHelpers";
import { AssetCard } from "./AssetCard";

interface NativeCardProps extends CardProps {
	denom: string;
	amount: string;
	deleteFn?: (index: number) => void;
	isValidCallback?: (result: boolean | undefined) => void;
	index?: number;
}

export function NativeCard({
	denom,
	amount,
	deleteFn,
	index = 0,
	...cardProps
}: NativeCardProps) {
	const { assets } = useChain(env.CHAIN);
	const [asset, setAsset] = useState<Asset>();
	const [coin, setCoin] = useState<Coin>();

	useEffect(() => {
		if (assets)
			getCoinAsset(denom, assets.assets).then(
				(asset) => setAsset(asset),
				(_x) => setAsset(undefined),
			);
	}, [assets, denom]);
	useEffect(() => {
		if (asset) setCoin(getDisplayCoin({ denom, amount }, asset));
		else setCoin(undefined);
	}, [asset, denom, amount]);

	if (!asset || !coin) return null;
	return (
		<AssetCard
			asset={asset}
			amount={coin.amount}
			deleteFn={deleteFn}
			index={index}
			{...cardProps}
		/>
	);
}
