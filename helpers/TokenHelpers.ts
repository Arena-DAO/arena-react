import env from "@config/env";
import { Metadata } from "cosmjs-types/cosmos/bank/v1beta1/bank";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { Asset } from "@chain-registry/types";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Cw20BaseQueryClient } from "@cw-plus/Cw20Base.client";
import { isValidContractAddress } from "./AddressHelpers";
import { convertIPFSToHttp } from "./IPFSHelpers";
async function fetchDenomMetadata(
  denom: string
): Promise<Metadata | undefined> {
  try {
    const response = await fetch(
      `${env.JUNO_API_URL}/cosmos/bank/v1beta1/denoms_metadata/${denom}`
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`${err.message || "Unknown error"}`);
    }

    const data = await response.json();

    // Safely parse the JSON and ensure it's in the correct format
    const metadata: Metadata = JSON.parse(data);
    if (!metadata || !metadata.denomUnits) {
      throw new Error(`Could not parse the metadata`);
    }

    return metadata;
  } catch (error) {
    console.error("Error fetching denom metadata: ", error);
    return undefined;
  }
}

export async function getCoinAsset(
  denom: string,
  assets: Asset[]
): Promise<Asset | undefined> {
  // Attempt to find the Metadata through the chain-registry first
  let asset = assets.find((x) =>
    x.denom_units.find((y) => y.denom.toLowerCase() == denom.toLowerCase())
  );

  // Otherwise, call the x/bank module for info
  if (!asset) {
    const metadata = await fetchDenomMetadata(denom);
    if (metadata) asset = convertMetadataToAsset(metadata);
    else return undefined;
  }

  return asset;
}

export async function getCw20Asset(
  address: string,
  cosmwasmClient: CosmWasmClient,
  assets: Asset[]
): Promise<Asset | undefined> {
  if (!isValidContractAddress(address)) return undefined;

  // Attempt to find the Metadata through the chain-registry first
  let asset = assets.find((x) => x.address == address);

  // Otherwise, call the contract
  if (!asset) {
    const cw20Client = new Cw20BaseQueryClient(cosmwasmClient, address);

    const base = "cw20:" + address;
    const tokenInfo = await cw20Client.tokenInfo();
    const marketingData = await cw20Client.marketingInfo();

    asset = {
      denom_units: [
        { denom: base, exponent: 0 },
        { denom: tokenInfo.name, exponent: tokenInfo.decimals },
      ],
      base: base,
      name: tokenInfo.name,
      symbol: tokenInfo.symbol,
      display: tokenInfo.name,
    };

    if (marketingData.logo)
      if (marketingData.logo === "embedded") {
        const logoResponse = await cw20Client.downloadLogo();

        asset.logo_URIs = {
          svg: `data:${logoResponse.mime_type};base64,${logoResponse.data}`,
        };
      } else {
        asset.logo_URIs = { svg: convertIPFSToHttp(marketingData.logo.url) };
      }
  }

  return asset;
}

export function getCoinConversion(
  coin: Coin,
  to_denom: string,
  asset: Asset
): Coin {
  if (coin.denom == to_denom) return coin;
  let original_units = asset.denom_units.find(
    (x) => x.denom.toLowerCase() == coin.denom.toLowerCase()
  );
  let new_units = asset.denom_units.find(
    (x) => x.denom.toLowerCase() == to_denom.toLowerCase()
  );
  if (!original_units || !new_units)
    throw `Could not convert ${coin.denom} to ${to_denom}`;

  let amount =
    Math.pow(10, original_units.exponent - new_units.exponent) *
    parseFloat(coin.amount.replace(/,/g, ""));
  return {
    denom: to_denom,
    amount: isNaN(amount)
      ? "0"
      : amount.toLocaleString(undefined, {
          maximumFractionDigits: new_units.exponent,
        }),
  };
}

export function getDisplayCoin(coin: Coin, asset: Asset): Coin {
  return getCoinConversion(coin, asset.display, asset);
}

export function getBaseCoin(coin: Coin, asset: Asset): Coin {
  return getCoinConversion(coin, asset.base, asset);
}

function convertMetadataToAsset(metadata: Metadata): Asset {
  return {
    description: metadata.description,
    denom_units: metadata.denomUnits.map((unit) => ({
      denom: unit.denom,
      exponent: unit.exponent,
      aliases: unit.aliases,
    })),
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
