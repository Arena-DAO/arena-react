import "../styles/app.scss";
import type { AppProps } from "next/app";
import { ChainProvider } from "@cosmos-kit/react";
import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as leapWallets } from "@cosmos-kit/leap";
import { chains, assets } from "chain-registry";
import MainLayout from "../components/MainLayout";
import { getMorpheusAssets, getMorpheusChain } from "../config/desmos";
import DesmosProvider from "../components/DesmosProvider";
import theme from "../config/theme";
import React from "react";
import { ChakraProvider } from "@chakra-ui/react";

export default function CreateCosmosApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <ChainProvider
        chains={[...chains, getMorpheusChain()]}
        assetLists={[...assets, getMorpheusAssets()]}
        wallets={[...keplrWallets, ...leapWallets]}
        wrappedWithChakra
      >
        <DesmosProvider>
          <MainLayout>
            <Component {...pageProps} />
          </MainLayout>
        </DesmosProvider>
      </ChainProvider>
    </ChakraProvider>
  );
}
