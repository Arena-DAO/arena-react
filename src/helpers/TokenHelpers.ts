import type { Asset } from "@chain-registry/types";
import type { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { Metadata } from "cosmjs-types/cosmos/bank/v1beta1/bank";
import type { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { Cw20BaseQueryClient } from "~/codegen/Cw20Base.client";
import { isValidContractAddress } from "./AddressHelpers";

export function getTokenConversion(
	coin: Coin,
	to_denom: string,
	asset: Asset,
): Coin {
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
		const denom = isCw20 ? `cw20:${denomOrAddress}` : denomOrAddress;
		return assets.find((asset) =>
			asset?.denom_units?.find((denomUnit) => denomUnit?.denom === denom),
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
	const isAddress = isValidContractAddress(denomOrAddress, prefix);
	const localAsset = findAssetInAssets(denomOrAddress, assets, isAddress);
	if (localAsset) {
		return localAsset;
	}

	if (!isAddress) {
		throw new Error("Cannot find cw20 asset");
	}

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
			{ denom: tokenInfo.symbol.toLowerCase(), exponent: tokenInfo.decimals },
		],
		base: tokenInfo.symbol.toLowerCase(),
		name: tokenInfo.name,
		symbol: tokenInfo.symbol,
		logo_URIs: {
			svg:
				marketingInfo?.logo === "embedded"
					? logo
						? `data:${logo.mime_type};base64,${logo.data}`
						: undefined
					: marketingInfo?.logo?.url,
		},
	} as Asset;
}

export async function getNativeAsset(
	denom: string,
	apiUrl: string,
	assets?: Asset[],
): Promise<Asset> {
	const localAsset = findAssetInAssets(denom, assets);
	if (localAsset) {
		return localAsset;
	}

	// NOTE: This will not support tokenfactory denoms, because the slashes mess with the route
	const response = await fetch(
		`${apiUrl}/cosmos/bank/v1beta1/denoms_metadata/${denom}`,
		{ mode: "no-cors" },
	);

	if (!response.ok) {
		const err = await response.json();
		throw new Error(`${err.message || "Unknown error"}`);
	}

	const data = await response.json();

	// Safely parse the JSON and ensure it's in the correct format
	const metadata: Metadata = JSON.parse(data);
	if (!metadata || !metadata.denomUnits) {
		throw new Error("Could not parse the metadata");
	}

	return {
		description: metadata.description,
		denom_units: metadata.denomUnits,
		base: metadata.base,
		name: metadata.name,
		display: metadata.display,
		symbol: metadata.symbol,
		logo_URIs: {
			// Assuming uri holds an image
			svg: metadata.uri,
		},
	};
}
