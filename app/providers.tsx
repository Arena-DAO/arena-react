"use client";

import type { Asset, AssetList, Chain } from "@chain-registry/types";
import { GasPrice } from "@cosmjs/stargate";
import { wallets as cosmosExtensionMetamaskWallets } from "@cosmos-kit/cosmos-extension-metamask";
import { wallets as cosmostationWallets } from "@cosmos-kit/cosmostation";
import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as leapWallets } from "@cosmos-kit/leap";
import { wallets as ledgerWallets } from "@cosmos-kit/ledger";
import { ChainProvider } from "@cosmos-kit/react";
import { wallets as stationWallets } from "@cosmos-kit/station";
import { NextUIProvider } from "@nextui-org/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	assets as mainnetAssets,
	chain as mainnetChain,
} from "chain-registry/mainnet/neutron";
import {
	assets as testnetAssets,
	chain as testnetChain,
} from "chain-registry/testnet/neutrontestnet";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { type PropsWithChildren, useMemo } from "react";
import { ToastContainer } from "react-toastify";
import { useEnv } from "~/hooks/useEnv";
import "~/styles/globals.css";

const queryClient = new QueryClient();

function InnerProviders({ children }: PropsWithChildren) {
	const { theme } = useTheme();
	const { data: env } = useEnv();
	const signerOptions = {
		signingCosmwasm: (chain: string | Chain) => {
			if (typeof chain !== "string" && chain.chain_name === env.CHAIN)
				return {
					gasPrice: GasPrice.fromString(
						`${chain.fees?.fee_tokens[0]?.average_gas_price?.toString()}${
							chain.fees?.fee_tokens[0]?.denom
						}`,
					),
				};
			return undefined;
		},
	};
	const chainsMemo = useMemo(
		() => (env.ENV === "development" ? [testnetChain] : [mainnetChain]),
		[env.ENV],
	);
	const assetsMemo = useMemo(() => {
		if (env.ENV === "development") {
			// Create a new testnet asset for Arena DAO token
			const arenaTestnetAsset: Asset = {
				description: "The governance token of the Arena DAO",
				address:
					"factory/neutron1r3slyjlf7g76mz3na6gh7c8ek62rhssrzf60uh0emyw3x94rppyqfcs0pk/uarena",
				denom_units: [
					{
						denom:
							"factory/neutron1r3slyjlf7g76mz3na6gh7c8ek62rhssrzf60uh0emyw3x94rppyqfcs0pk/uarena",
						exponent: 0,
					},
					{
						denom: "arena",
						exponent: 6,
					},
				],
				base: "factory/neutron1r3slyjlf7g76mz3na6gh7c8ek62rhssrzf60uh0emyw3x94rppyqfcs0pk/uarena",
				name: "Arena Token",
				display: "arena",
				symbol: "ARENA",
				logo_URIs: {
					svg: "/logo.svg",
				},
			};

			// Create a new array with the existing testnet assets
			const updatedTestnetAssets: AssetList = {
				...testnetAssets,
				assets: [...testnetAssets.assets, arenaTestnetAsset],
			};

			return [updatedTestnetAssets];
		}
		// For mainnet, return the original mainnet assets
		return [mainnetAssets];
	}, [env.ENV]);

	return (
		<ChainProvider
			chains={chainsMemo}
			assetLists={assetsMemo}
			wallets={[
				...keplrWallets,
				...leapWallets,
				...ledgerWallets,
				...cosmostationWallets,
				...stationWallets,
				...cosmosExtensionMetamaskWallets,
			]}
			signerOptions={signerOptions}
			walletConnectOptions={{
				signClient: {
					projectId: env.WALLETCONNECT_PROJECT_ID,
				},
			}}
			throwErrors="connect_only"
			logLevel={env.ENV === "production" ? "NONE" : undefined}
			modalTheme={{ defaultTheme: theme === "light" ? "light" : "dark" }}
			allowedIframeParentOrigins={[
				"https://dao.daodao.zone",
				env.DAO_DAO_URL,
				"http://localhost:3001",
			]}
		>
			{children}
			<ToastContainer position="bottom-right" theme={theme} />
		</ChainProvider>
	);
}

export function Providers({ children }: PropsWithChildren) {
	const router = useRouter();

	return (
		<QueryClientProvider client={queryClient}>
			<NextUIProvider navigate={router.push}>
				<NextThemesProvider attribute="class" defaultTheme="dark">
					<InnerProviders>{children}</InnerProviders>
				</NextThemesProvider>
			</NextUIProvider>
		</QueryClientProvider>
	);
}
