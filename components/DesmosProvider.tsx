import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { useChain } from "@cosmos-kit/react";
import { PropsWithChildren } from "react";

export default function DesmosProvider({ children }: PropsWithChildren) {
  const desmosContext = useChain(process.env.NEXT_PUBLIC_DESMOS!);

  //set desmos gql
  desmosContext.chain.apis!.gql! = [
    { address: "https://gql.mainnet.desmos.network/v1/graphql" },
  ];

  const gql = desmosContext.chain.apis!.gql![0]!.address;

  const client = new ApolloClient({
    uri: gql,
    cache: new InMemoryCache(),
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
