import {
  Container,
  Heading,
  SimpleGrid,
  useBreakpointValue,
} from "@chakra-ui/react";
import { CategoryMap, CategoryRoot } from "@config/featured";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { CompetitionCategoryCard } from "@components/pages/compete/CompetitionCategoryCard";
import { CompetitionsSection } from "@components/pages/compete/CompetitionsSection";
import env from "@config/env";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useChain } from "@cosmos-kit/react";

export default function Compete() {
  const router = useRouter();
  const { category } = router.query;
  const { getCosmWasmClient } = useChain(env.CHAIN);
  const [cosmwasmClient, setCosmwasmClient] = useState<
    CosmWasmClient | undefined
  >(undefined);
  useEffect(() => {
    async function fetchClient() {
      setCosmwasmClient(await getCosmWasmClient());
    }
    fetchClient();
  }, [getCosmWasmClient]);

  const minChildWidth = useBreakpointValue({
    base: "200px",
    sm: "300px",
    md: "400px",
  });
  const daoItem = useMemo(
    () =>
      category
        ? CategoryMap.get(category as string) ?? CategoryRoot
        : CategoryRoot,
    [category]
  );

  return (
    <Container maxW={{ base: "full" }} centerContent pb={10}>
      <Heading mb="6">
        {daoItem.title} {daoItem.children && "Categories"}
      </Heading>
      <SimpleGrid minChildWidth={minChildWidth} spacing="5" width="100%">
        {daoItem.children?.map((x) => {
          return <CompetitionCategoryCard item={x} key={x.url} />;
        })}
      </SimpleGrid>
      {daoItem.category_id && cosmwasmClient && (
        <>
          <CompetitionsSection
            title="Wagers"
            cosmwasmClient={cosmwasmClient}
            category_id={daoItem.category_id}
            module_addr={env.ARENA_WAGER_MODULE_ADDRESS}
            path="wager"
          />
          <CompetitionsSection
            title="Leagues"
            cosmwasmClient={cosmwasmClient}
            category_id={daoItem.category_id}
            module_addr={env.ARENA_LEAGUE_MODULE_ADDRESS}
            path="league"
          />
        </>
      )}
    </Container>
  );
}
