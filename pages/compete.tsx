import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Flex,
  Heading,
  SimpleGrid,
  useBreakpointValue,
} from "@chakra-ui/react";
import { CategoryMap, CategoryRoot } from "@config/categories";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { CompetitionCategoryCard } from "@components/pages/compete/CompetitionCategoryCard";
import { CompetitionsSection } from "@components/pages/compete/CompetitionsSection";
import env from "@config/env";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useChain } from "@cosmos-kit/react";
import { AddIcon } from "@chakra-ui/icons";
import NextLink from "next/link";

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
        {daoItem.title} {"children" in daoItem && "Categories"}
      </Heading>
      {"children" in daoItem && (
        <SimpleGrid minChildWidth={minChildWidth} spacing="5" width="100%">
          {daoItem.children.map((x) => {
            return <CompetitionCategoryCard item={x} key={x.url} />;
          })}
        </SimpleGrid>
      )}
      {"category_id" in daoItem && cosmwasmClient && (
        <>
          <Flex w="full" justifyContent={"flex-end"}>
            <ButtonGroup variant="outline" size="sm">
              <NextLink href={`/wager/create?category=${category}`}>
                <Button leftIcon={<AddIcon />}>Create Wager</Button>
              </NextLink>
              <NextLink href={`/league/create?category=${category}`}>
                <Button leftIcon={<AddIcon />}>Create League</Button>
              </NextLink>
            </ButtonGroup>
          </Flex>
          <CompetitionsSection
            title="Wagers"
            cosmwasmClient={cosmwasmClient}
            category_id={daoItem.category_id}
            module_addr={env.ARENA_WAGER_MODULE_ADDRESS}
            category={category as string}
            path="wager"
          />
          <CompetitionsSection
            title="Leagues"
            cosmwasmClient={cosmwasmClient}
            category={category as string}
            category_id={daoItem.category_id}
            module_addr={env.ARENA_LEAGUE_MODULE_ADDRESS}
            path="league"
          />
        </>
      )}
    </Container>
  );
}
