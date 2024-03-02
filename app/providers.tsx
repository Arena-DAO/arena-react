"use client";

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
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
import { PropsWithChildren } from "react";
import { useEnv } from "~/hooks/useEnv";
import "~/styles/globals.css";

function InnerProviders({ children }: PropsWithChildren) {
	const router = useRouter();
	const { data: env } = useEnv();

	return (
		<NextUIProvider navigate={router.push}>
			<NextThemesProvider attribute="class" defaultTheme="dark">
				<ChainProvider
					chains={chains.filter((x) => x.chain_name === env.CHAIN)}
					assetLists={assets.filter((x) => x.chain_name === env.CHAIN)}
					wallets={[
						...keplrWallets,
						...leapWallets,
						...ledgerWallets,
						...vectisWallets,
						...stationWallets,
					]}
					walletConnectOptions={{
						signClient: {
							projectId: env.WALLETCONNECT_PROJECT_ID,
						},
					}}
				>
					{children}
				</ChainProvider>
			</NextThemesProvider>
		</NextUIProvider>
	);
}

export function Providers({ children }: PropsWithChildren) {
	const queryClient = new QueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			<InnerProviders>{children}</InnerProviders>
		</QueryClientProvider>
	);
}
