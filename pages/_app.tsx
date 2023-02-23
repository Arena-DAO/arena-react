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
import { EmptyState, SaasProvider, ErrorBoundary } from "@saas-ui/react";
import NextLink, { LinkProps } from "next/link";

const Link: React.FC<LinkProps> = (props) => {
  return <NextLink {...props} legacyBehavior />;
};

export default function CreateCosmosApp({ Component, pageProps }: AppProps) {
  const onError = React.useCallback((error: Error) => {
    console.log(error);
  }, []);

  return (
    <SaasProvider theme={theme} linkComponent={Link} onError={onError}>
      <ChainProvider
        chains={[...chains, getMorpheusChain()]}
        assetLists={[...assets, getMorpheusAssets()]}
        wallets={[...keplrWallets, ...leapWallets]}
        modalTheme={theme}
      >
        <DesmosProvider>
          <MainLayout>
            <ErrorBoundary
              errorComponent={<EmptyState title="Oops an error has occurred" />}
            >
              <Component {...pageProps} />
            </ErrorBoundary>
          </MainLayout>
        </DesmosProvider>
      </ChainProvider>
    </SaasProvider>
  );
}
