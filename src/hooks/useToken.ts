import { Asset } from "@chain-registry/types";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useChain } from "@cosmos-kit/react";
import { useQuery } from "@tanstack/react-query";
import { Metadata } from "cosmjs-types/cosmos/bank/v1beta1/bank";
import { Cw20BaseQueryClient } from "~/codegen/Cw20Base.client";
import { isValidContractAddress } from "~/helpers/AddressHelpers";
import { useEnv } from "./useEnv";

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

async function getCw20Asset(
	cosmWasmClient: CosmWasmClient,
	denomOrAddress: string,
	assets?: Asset[],
	prefix?: string,
): Promise<Asset | undefined> {
	const isAddress = isValidContractAddress(denomOrAddress, prefix);
	const localAsset = findAssetInAssets(denomOrAddress, assets, isAddress);
	if (localAsset) {
		return localAsset;
	}

	if (!isAddress) {
		return undefined;
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
async function getNativeAsset(
	denom: string,
	apiUrl: string,
	assets?: Asset[],
): Promise<Asset | undefined> {
	const localAsset = findAssetInAssets(denom, assets);
	if (localAsset) {
		return localAsset;
	}

	const response = await fetch(
		`${apiUrl}/cosmos/bank/v1beta1/denoms_metadata/${denom}`,
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

export const useToken = (
	cosmWasmClient: CosmWasmClient,
	denomOrAddress: string,
	isNative = true,
	chain?: string,
) => {
	const { data: env } = useEnv();
	const { assets } = useChain(chain ?? env.CHAIN);

	return useQuery(["token", denomOrAddress], async () =>
		isNative
			? await getNativeAsset(denomOrAddress, env.JUNO_API_URL, assets?.assets)
			: await getCw20Asset(
					cosmWasmClient,
					denomOrAddress,
					assets?.assets,
					env.BECH32_PREFIX,
			  ),
	);
};
