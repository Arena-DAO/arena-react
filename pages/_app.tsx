import "../styles/app.scss";
import type { AppProps } from "next/app";
import { ChainProvider } from "@cosmos-kit/react";
import {
  ChakraProvider,
  extendTheme,
  theme as baseTheme,
} from "@chakra-ui/react";
import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as cosmostationWallets } from "@cosmos-kit/cosmostation";
import { wallets as leapWallets } from "@cosmos-kit/leap";
import { wallets as vectisWallets } from "@cosmos-kit/vectis";
import { chains, assets } from "chain-registry";
import Layout from "../components/MainLayout";
import ErrorBoundary from "../components/ErrorBoundary";
import { getConstantineAssets, getConstantineChain } from "../config/archway";
import { getMorpheusAssets, getMorpheusChain } from "../config/desmos";
import DesmosProvider from "../components/DesmosProvider";
import theme from "./theme";

function CreateCosmosApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <ChainProvider
        chains={[...chains, getMorpheusChain(), getConstantineChain()]}
        assetLists={[...assets, getConstantineAssets(), getMorpheusAssets()]}
        wallets={[
          ...keplrWallets,
          ...cosmostationWallets,
          ...leapWallets,
          ...vectisWallets,
        ]}
      >
        <DesmosProvider>
          <Layout>
            <ErrorBoundary>
              <Component {...pageProps} />
            </ErrorBoundary>
          </Layout>
        </DesmosProvider>
      </ChainProvider>
    </ChakraProvider>
  );
}

export default CreateCosmosApp;
