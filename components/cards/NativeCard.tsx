import { CardProps } from "@chakra-ui/card";
import { useChain } from "@cosmos-kit/react-lite";
import env from "@config/env";
import { useState, useEffect } from "react";
import { Asset } from "@chain-registry/types";
import { getCoinAsset, getDisplayCoin } from "~/helpers/TokenHelpers";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
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
        (asset) => {
          setAsset(asset);
          if (asset) {
            setCoin(getDisplayCoin({ denom, amount }, asset));
          }
        },
        (_x) => setAsset(undefined)
      );
  }, [assets, amount, denom]);

  if (!asset || !coin) return null;
  return (
    <AssetCard
      asset={asset}
      amount={coin.amount}
      deleteFn={deleteFn}
      index={index}
      {...cardProps}
    ></AssetCard>
  );
}
