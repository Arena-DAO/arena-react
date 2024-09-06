import type { Asset } from "@chain-registry/types";
import type { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { QueryClient, setupBankExtension } from "@cosmjs/stargate";
import { Comet38Client } from "@cosmjs/tendermint-rpc";
import type { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { Cw20BaseQueryClient } from "~/codegen/Cw20Base.client";
import { isValidContractAddress } from "./AddressHelpers";
import { withIpfsSupport } from "./IPFSHelpers";

export function getTokenConversion(
	coin: Coin,
	to_denom: string,
	asset: Asset,
): Coin {
	if (asset.type_asset === "cw20") {
		if (isValidContractAddress(coin.denom)) {
			coin.denom = `cw20:${coin.denom}`;
		}
	}

	if (coin.denom === to_denom) return coin;
	const original_units = asset.denom_units.find(
		(x) => x.denom.toLowerCase() === coin.denom.toLowerCase(),
	);
	const new_units = asset.denom_units.find(
		(x) => x.denom.toLowerCase() === to_denom.toLowerCase(),
	);
	if (!original_units || !new_units)
		throw new Error(`Cannot convert token from ${coin.denom} to ${to_denom}`);

	const amount =
		10 ** (original_units.exponent - new_units.exponent) *
		Number.parseFloat(coin.amount.replace(/,/g, ""));
	return {
		denom: to_denom,
		amount: Number.isNaN(amount)
			? "0"
			: amount
					.toLocaleString(undefined, {
						maximumFractionDigits: new_units.exponent,
					})
					.replace(/,/g, ""),
	};
}

export function getDisplayToken(coin: Coin, asset: Asset): Coin {
	if (asset.display === "") return coin;
	return getTokenConversion(coin, asset.display, asset);
}

export function getBaseToken(coin: Coin, asset: Asset): Coin {
	return getTokenConversion(coin, asset.base, asset);
}

function findAssetInAssets(
	denomOrAddress: string,
	assets?: Asset[],
	isCw20 = false,
) {
	if (assets) {
		if (isCw20) {
			return assets
				.filter((x) => x.type_asset === "cw20")
				.find((asset) =>
					asset?.denom_units?.find(
						(denomUnit) => denomUnit?.denom?.toLowerCase() === denomOrAddress,
					),
				);
		}
		return assets.find((asset) =>
			asset?.denom_units?.find(
				(denomUnit) => denomUnit?.denom?.toLowerCase() === denomOrAddress,
			),
		);
	}
	return undefined;
}

export async function getCw20Asset(
	cosmWasmClient: CosmWasmClient,
	denomOrAddress: string,
	assets?: Asset[],
	prefix?: string,
): Promise<Asset> {
	// Try to find the asset locally
	const isAddress = isValidContractAddress(denomOrAddress, prefix);
	const localAsset = findAssetInAssets(
		isAddress
			? `cw20:${denomOrAddress.toLowerCase()}`
			: denomOrAddress.toLowerCase(),
		assets,
		true,
	);
	if (localAsset) {
		return localAsset;
	}

	// If given a cw20 address, then just query the cw20 contract
	if (isAddress) {
		const client = new Cw20BaseQueryClient(cosmWasmClient, denomOrAddress);
		const tokenInfo = await client.tokenInfo();
		const marketingInfo = await client.marketingInfo();
		const logo =
			marketingInfo?.logo === "embedded"
				? await client.downloadLogo()
				: undefined;
		return {
			description: "A cw20 token with information form the contract",
			type_asset: "cw20",
			address: denomOrAddress,
			denom_units: [
				{ denom: `cw20:${denomOrAddress}`, exponent: 0 },
				{ denom: tokenInfo.symbol, exponent: tokenInfo.decimals },
			],
			base: `cw20:${denomOrAddress}`,
			name: tokenInfo.name,
			display: tokenInfo.symbol,
			symbol: tokenInfo.symbol,
			logo_URIs: {
				svg:
					marketingInfo?.logo === "embedded"
						? logo
							? `data:${logo.mime_type};base64,${logo.data}`
							: undefined
						: withIpfsSupport(marketingInfo?.logo?.url),
			},
		} as Asset;
	}

	throw "Could not find cw20 token";
}

export async function getNativeAsset(
	denom: string,
	rpcUrl: string,
	assets?: Asset[],
): Promise<Asset> {
	// Try to find the asset locally
	const localAsset = findAssetInAssets(denom.toLowerCase(), assets);
	if (localAsset) {
		return localAsset;
	}

	// Query the bank module
	const queryClient = new QueryClient(await Comet38Client.connect(rpcUrl));
	const bankExtension = setupBankExtension(queryClient);

	const metadata = await bankExtension.bank.denomMetadata(denom);

	return {
		description: metadata.description,
		denom_units: metadata.denomUnits,
		base: metadata.base,
		name: metadata.name,
		display: metadata.display || metadata.base,
		symbol: metadata.symbol || metadata.base,
		logo_URIs: {
			// Assuming uri holds an image
			svg: metadata.uri,
		},
	};
}
