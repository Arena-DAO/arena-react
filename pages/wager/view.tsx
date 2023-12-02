import { Box, Container, Heading } from "@chakra-ui/layout";
import ViewCompetition from "@components/competition/ViewCompetition";
import { CategoryMap } from "@config/categories";
import env from "@config/env";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useChain } from "@cosmos-kit/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

const ViewWagerPage = () => {
  const { getCosmWasmClient } = useChain(env.CHAIN);
  const {
    query: { id, category },
  } = useRouter();

  const [cosmwasmClient, setCosmwasmClient] = useState<
    CosmWasmClient | undefined
  >(undefined);
  useEffect(() => {
    async function fetchClient() {
      setCosmwasmClient(await getCosmWasmClient());
    }
    fetchClient();
  }, [getCosmWasmClient]);

  const [categoryName, setCategoryName] = useState<string>();
  useEffect(() => {
    if (typeof category === "string") {
      let categoryItem = CategoryMap.get(category);
      setCategoryName(categoryItem?.title);
    }
  }, [category]);

  return (
    <Container maxW={{ base: "full", md: "5xl" }} centerContent pb={10}>
      <Heading>
        {categoryName} Wager {id}
      </Heading>
      <Box w="100%">
        {cosmwasmClient && typeof id === "string" && (
          <ViewCompetition
            module_addr={env.ARENA_WAGER_MODULE_ADDRESS}
            id={id}
            cosmwasmClient={cosmwasmClient}
          />
        )}
      </Box>
    </Container>
  );
};

export default ViewWagerPage;
