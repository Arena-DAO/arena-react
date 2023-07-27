import "../styles/app.scss";
import type { AppProps } from "next/app";
import { ChainProvider } from "@cosmos-kit/react";
import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as leapWallets } from "@cosmos-kit/leap";
import { chains, assets } from "chain-registry";
import MainLayout from "../components/MainLayout";
import theme from "../config/theme";
import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MainWalletBase, SignerOptions } from "@cosmos-kit/core";
import { GasPrice } from "@cosmjs/stargate";
import "@interchain-ui/react/styles";

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
        assetLists={assets}
        wallets={
          [...keplrWallets, ...leapWallets] as unknown as MainWalletBase[]
        }
        signerOptions={signerOptions}
      >
        <QueryClientProvider client={queryClient}>
          <MainLayout>
            <Component {...pageProps} />
          </MainLayout>
        </QueryClientProvider>
      </ChainProvider>
    </ChakraProvider>
  );
}
