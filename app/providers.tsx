"use client";

import type { Chain } from "@chain-registry/types";
import { GasPrice } from "@cosmjs/stargate";
import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as leapWallets } from "@cosmos-kit/leap";
import { wallets as ledgerWallets } from "@cosmos-kit/ledger";
import { ChainProvider } from "@cosmos-kit/react";
import { wallets as stationWallets } from "@cosmos-kit/station";
import { wallets as vectisWallets } from "@cosmos-kit/vectis";
import "@interchain-ui/react/styles";
import { NextUIProvider } from "@nextui-org/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { assets, chains } from "chain-registry";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { type PropsWithChildren, useMemo } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
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
		() => chains.filter((x) => x.chain_name === env.CHAIN),
		[env.CHAIN],
	);
	const assetsMemo = useMemo(() => {
		const assetsList = assets.filter((x) => x.chain_name === env.CHAIN);

		return assetsList;
	}, [env.CHAIN]);

	return (
		<ChainProvider
			chains={chainsMemo}
			assetLists={assetsMemo}
			wallets={[
				...keplrWallets,
				...leapWallets,
				...ledgerWallets,
				...vectisWallets,
				...stationWallets,
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
