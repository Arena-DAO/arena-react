import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { useManager } from "@cosmos-kit/react";
import { PropsWithChildren } from "react";

export default function DesmosProvider({ children }: PropsWithChildren) {
  const manager = useManager();

  //set desmos gql
  manager.getChainRecord("desmos").chain.apis!.gql! = [
    { address: "https://gql.mainnet.desmos.network/v1/graphql" },
  ];

  const gql = manager.getChainRecord(process.env.NEXT_PUBLIC_DESMOS!).chain
    .apis!.gql![0]!.address;

  const client = new ApolloClient({
    uri: gql,
    cache: new InMemoryCache(),
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
