import { Box, Container, Heading } from "@chakra-ui/layout";
import ViewCompetition from "@components/competition/ViewCompetition";
import env from "@config/env";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useChain } from "@cosmos-kit/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

const ViewWagerPage = () => {
  const { getCosmWasmClient } = useChain(env.CHAIN);
  const {
    query: { dao, id },
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

  return (
    <Container maxW={{ base: "full", md: "5xl" }} centerContent pb={10}>
      <Heading>Wager {id}</Heading>
      <Box w="100%">
        {cosmwasmClient &&
          typeof dao === "string" &&
          typeof id === "string" && (
            <ViewCompetition
              dao={dao}
              id={id}
              cosmwasmClient={cosmwasmClient}
            />
          )}
      </Box>
    </Container>
  );
};

export default ViewWagerPage;
