import { Container, Heading, SimpleGrid, Stack } from "@chakra-ui/react";
import { DAOMap, DAORoot } from "@config/featured";
import { useRouter } from "next/router";
import { DAOCard } from "@components/cards/DAOCard";
import { useChain } from "@cosmos-kit/react";
import env from "@config/env";
import { useEffect, useState } from "react";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { FeaturedDAOItemCard } from "@components/pages/featured/DAOItemCard";

export default function FeaturedDAOs() {
  const router = useRouter();
  const { getCosmWasmClient } = useChain(env.CHAIN);
  const { id } = router.query;
  const [cosmwasmClient, setCosmwasmClient] = useState<
    CosmWasmClient | undefined
  >(undefined);
  useEffect(() => {
    async function fetchClient() {
      setCosmwasmClient(await getCosmWasmClient());
    }
    fetchClient();
  }, [getCosmWasmClient]);
  const daoItem = id ? DAOMap.get(id as string) ?? DAORoot : DAORoot;

  return (
    <Container maxW={{ base: "full" }} centerContent pb={10}>
      <Heading>
        {daoItem.title} {daoItem.children && "Categories"}
      </Heading>
      <SimpleGrid minChildWidth="300px" spacing="5" width="100%">
        {daoItem.children?.map((x) => {
          return <FeaturedDAOItemCard item={x} key={x.url} />;
        })}
      </SimpleGrid>
      {daoItem.addrs && (
        <Heading mt="5" className="holographic" fontWeight="extrabold" mb={3}>
          DAO&apos;s
        </Heading>
      )}
      <SimpleGrid minChildWidth="300px" spacing="5" width="100%">
        {cosmwasmClient &&
          daoItem.addrs?.map((x, i) => {
            return (
              <DAOCard address={x} cosmwasmClient={cosmwasmClient} key={i} />
            );
          })}
      </SimpleGrid>
    </Container>
  );
}
