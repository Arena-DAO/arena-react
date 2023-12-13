import "../styles/app.scss";
import type { AppProps } from "next/app";
import { ChainProvider } from "@cosmos-kit/react";
import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as leapWallets } from "@cosmos-kit/leap";
import { wallets as vectisWallets } from "@cosmos-kit/vectis";
import { wallets as ledgerWallets } from "@cosmos-kit/ledger";
import { chains, assets } from "chain-registry";
import MainLayout from "../components/layouts/MainLayout";
import theme from "../config/theme";
import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MainWalletBase, SignerOptions } from "@cosmos-kit/core";
import { GasPrice } from "@cosmjs/stargate";
import "@interchain-ui/react/styles";
import env from "@config/env";
import { AssetList } from "@chain-registry/types";
import { CategoriesContext } from "~/contexts/CategoriesContext";
import { CategoryMap } from "@config/categories";

export default function CreateCosmosApp({ Component, pageProps }: AppProps) {
  const queryClient = new QueryClient({});
  const signerOptions: SignerOptions = {
    signingCosmwasm: (chain) => {
      if (chain.chain_name.startsWith("juno"))
        return {
          gasPrice: GasPrice.fromString(
            chain.fees!.fee_tokens[0]!.average_gas_price! +
              chain.fees!.fee_tokens[0]!.denom!
          ),
        };
      return undefined;
    },
  };

  return (
    <ChakraProvider theme={theme}>
      <ChainProvider
        chains={chains}
        assetLists={assets as unknown as AssetList[]}
        wallets={
          [
            ...keplrWallets,
            ...leapWallets,
            ...vectisWallets,
            ...ledgerWallets,
          ] as unknown as MainWalletBase[]
        }
        signerOptions={signerOptions}
        walletConnectOptions={{
          signClient: {
            projectId: env.WALLETCONNECT_PROJECT_ID,
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <CategoriesContext.Provider value={CategoryMap}>
            <MainLayout>
              <Component {...pageProps} />
            </MainLayout>
          </CategoriesContext.Provider>
        </QueryClientProvider>
      </ChainProvider>
    </ChakraProvider>
  );
}
