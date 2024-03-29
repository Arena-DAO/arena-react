import type { Asset } from "@chain-registry/types";

const USDC = {
	type_asset: "ics20",
	description: "USD Coin on Juno",
	denom_units: [
		{
			denom:
				"ibc/4A482FA914A4B9B05801ED81C33713899F322B24F76A06F4B8FE872485EA22FF",
			exponent: 0,
			aliases: ["uusdc", "microusdc"],
		},
		{
			denom: "usdc",
			exponent: 6,
		},
	],
	base: "ibc/4A482FA914A4B9B05801ED81C33713899F322B24F76A06F4B8FE872485EA22FF",
	name: "USD Coin",
	display: "usdc",
	symbol: "USDC",
	logo_URIs: {
		png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/USDCoin.png",
		svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/USDCoin.svg",
	},
	images: [
		{
			png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/USDCoin.png",
			svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/USDCoin.svg",
		},
	],
	traces: [
		{
			type: "ibc",
			counterparty: {
				channel_id: "channel-3",
				base_denom: "uusdc",
				chain_name: "noble",
			},
			chain: {
				channel_id: "channel-224",
				path: "transfer/channel-224/uusdc",
			},
		},
	],
} as Asset;

export const Assets = [USDC];
