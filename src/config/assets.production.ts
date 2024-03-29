import type { Asset } from "@chain-registry/types";

const USDC = {
	description: "USDC on Juno",
	denom_units: [
		{
			denom:
				"ibc/4A482FA914A4B9B05801ED81C33713899F322B24F76A06F4B8FE872485EA22FF",
			exponent: 0,
			aliases: ["uusdc"],
		},
		{
			denom: "USDC",
			exponent: 6,
		},
	],
	base: "ibc/4A482FA914A4B9B05801ED81C33713899F322B24F76A06F4B8FE872485EA22FF",
	name: "USDC",
	display: "USDC",
	symbol: "USDC",
	logo_URIs: {
		png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/USDCoin.png",
	},
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
			},
		},
	],
} as Asset;

export const Assets = [USDC];
