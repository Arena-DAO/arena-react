"use client";

import type { Chain } from "@chain-registry/types";
import { GasPrice } from "@cosmjs/stargate";
import { wallets as metamaskExtensionWallets } from "@cosmos-kit/cosmos-extension-metamask";
import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as leapWallets } from "@cosmos-kit/leap";
import { ChainProvider } from "@cosmos-kit/react";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
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
import { useEnv } from "~/hooks/useEnv";
import "~/styles/globals.css";

const queryClient = new QueryClient();

function InnerProviders({ children }: PropsWithChildren) {
	const { theme } = useTheme();
	const env = useEnv();
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
	const chainsMemo = useMemo(() => {
		if (env.ENV === "development") return [testnetChain];

		const filteredMainnet = { ...mainnetChain };
		if (filteredMainnet.apis) {
			filteredMainnet.apis = {
				...filteredMainnet.apis,
				rpc: filteredMainnet.apis.rpc?.filter(
					(api) => !api.address.toLowerCase().includes("quokkastake"),
				),
				rest: filteredMainnet.apis.rest?.filter(
					(api) => !api.address.toLowerCase().includes("quokkastake"),
				),
				grpc: filteredMainnet.apis.grpc?.filter(
					(grpc) => !grpc.address.includes("quokkastake"),
				),
			};
		}

		return [filteredMainnet];
	}, [env.ENV]);
	const assetsMemo = useMemo(() => {
		if (env.ENV === "development") {
			return [testnetAssets, mainnetAssets];
		}
		return [mainnetAssets];
	}, [env.ENV]);

	return (
		<ChainProvider
			chains={chainsMemo}
			assetLists={assetsMemo}
			wallets={[...keplrWallets, ...leapWallets, ...metamaskExtensionWallets]}
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
		</ChainProvider>
	);
}

export function Providers({ children }: PropsWithChildren) {
	const router = useRouter();

	return (
		<QueryClientProvider client={queryClient}>
			<HeroUIProvider navigate={router.push}>
				<NextThemesProvider attribute="class" defaultTheme="dark">
					<InnerProviders>{children}</InnerProviders>
				</NextThemesProvider>
				<ToastProvider
					toastProps={{
						variant: "flat",
						size: "lg",
						classNames: {
							base: "min-w-[350px] max-w-[90vw] sm:max-w-[400px] md:max-w-[500px] w-auto", // Responsive width
							content:
								"whitespace-normal break-words overflow-y-auto max-h-[200px]", // Text wrapping and overflow
						},
					}}
				/>
			</HeroUIProvider>
		</QueryClientProvider>
	);
}
