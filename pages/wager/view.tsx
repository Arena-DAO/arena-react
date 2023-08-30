import {
  Badge,
  Container,
  Heading,
  List,
  ListItem,
  Stack,
  Text,
} from "@chakra-ui/layout";
import { useChain } from "@cosmos-kit/react-lite";
import env from "@config/env";
import { useState, useEffect, useMemo, useCallback } from "react";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useRouter } from "next/router";
import { DAOCard } from "@components/cards/DAOCard";
import { useDaoDaoCoreGetItemQuery } from "@dao/DaoDaoCore.react-query";
import { DaoDaoCoreQueryClient } from "@dao/DaoDaoCore.client";
import { useArenaCoreQueryExtensionQuery } from "@arena/ArenaCore.react-query";
import { ArenaCoreQueryClient } from "@arena/ArenaCore.client";
import { useArenaWagerModuleCompetitionQuery } from "@arena/ArenaWagerModule.react-query";
import {
  ArenaWagerModuleClient,
  ArenaWagerModuleQueryClient,
} from "@arena/ArenaWagerModule.client";
import { Button, Skeleton, useToast } from "@chakra-ui/react";
import { statusColors } from "~/helpers/ArenaHelpers";
import { WagerViewDuesDisplay } from "@components/pages/wager/view/DuesDisplay";
import { AddressSchema } from "~/helpers/SchemaHelpers";
import { WagerViewBalanceCard } from "@components/pages/wager/view/BalanceCard";

interface ViewWagerPageContentProps {
  cosmwasmClient: CosmWasmClient;
}

function ViewWagerPageContent({ cosmwasmClient }: ViewWagerPageContentProps) {
  const {
    query: { dao, id },
  } = useRouter();
  const toast = useToast();
  const { getSigningCosmWasmClient, address } = useChain(env.CHAIN);
  const isValidAddress = useMemo(() => {
    return !!dao && AddressSchema.safeParse(dao).success;
  }, [dao]);
  const { data: itemData, isFetched: isItemFetched } =
    useDaoDaoCoreGetItemQuery({
      client: new DaoDaoCoreQueryClient(cosmwasmClient, dao as string),
      args: { key: env.ARENA_ITEM_KEY },
      options: { enabled: isValidAddress },
    });
  const { data: moduleData, isFetched: isModuleFetched } =
    useArenaCoreQueryExtensionQuery({
      client: new ArenaCoreQueryClient(cosmwasmClient, itemData?.item!),
      args: { msg: { competition_module: { key: env.WAGER_MODULE_KEY } } },
      options: { enabled: isItemFetched && !!itemData && !!itemData.item },
    });
  const { data, isLoading, isError } = useArenaWagerModuleCompetitionQuery({
    client: new ArenaWagerModuleQueryClient(cosmwasmClient, moduleData!),
    args: { id: id as string },
    options: {
      enabled:
        !!id &&
        !isNaN(parseInt(id as string)) &&
        isModuleFetched &&
        !!moduleData,
      retry: false,
    },
  });
  const [balanceChanged, setBalanceChanged] = useState<number>(0);
  useEffect(() => {
    if (isError)
      toast({
        title: "Error",
        isClosable: false,
        status: "error",
        description: `Could not retrieve competition ${id}`,
      });
  }, [isError, toast, id]);
  useEffect(() => {
    if (!isValidAddress) {
      toast({
        title: "Error",
        isClosable: false,
        status: "error",
        description: "DAO address is invalid",
      });
    }
  }, [isValidAddress, toast]);
  useEffect(() => {}, [data?.status]);
  const notifyBalancesChanged = useCallback(
    () => setBalanceChanged(balanceChanged + 1),
    [balanceChanged]
  );

  const generateProposals = async () => {
    try {
      let cosmwasmClient = await getSigningCosmWasmClient();
      if (!cosmwasmClient) throw "Could not get the CosmWasm client";

      let wagerModuleClient = new ArenaWagerModuleClient(
        cosmwasmClient,
        address!,
        moduleData!
      );

      await wagerModuleClient.generateProposals({ id: id as string });

      toast({
        title: "Success",
        isClosable: true,
        status: "success",
        description: "The competition's proposals have been generated.",
      });

      data!.status = "pending";
    } catch (e: any) {
      toast({
        status: "error",
        title: "Error",
        description: e.toString(),
        isClosable: true,
      });
    }
  };

  if (isError || !isValidAddress) {
    return <></>;
  }
  return (
    <Skeleton isLoaded={!isLoading} w="100%">
      <Stack>
        {!!data && (
          <DAOCard address={data.dao} cosmwasmClient={cosmwasmClient} />
        )}
        <Heading>
          {data?.name}{" "}
          <Badge
            variant="solid"
            ml={1}
            colorScheme={statusColors[data?.status || "inactive"]}
          >
            {data?.status}
          </Badge>
        </Heading>
        <Text>{data?.description}</Text>
        {(data?.rules.length ?? 0) > 0 && (
          <>
            <Heading size="md">Rules:</Heading>
            <List spacing={2}>
              {data?.rules.map((rule, idx) => (
                <ListItem key={idx}>{rule}</ListItem>
              ))}
            </List>
          </>
        )}
        {data && (
          <WagerViewDuesDisplay
            cosmwasmClient={cosmwasmClient}
            escrow_addr={data.escrow}
            balanceChanged={balanceChanged}
            notifyBalancesChanged={notifyBalancesChanged}
            wager_id={data.id}
          />
        )}
        {address && data && (
          <WagerViewBalanceCard
            address={address}
            cosmwasmClient={cosmwasmClient}
            escrow_address={data.escrow}
            status={data.status}
            notifyBalancesChanged={notifyBalancesChanged}
            balanceChanged={balanceChanged}
          />
        )}
        {data?.status == "created" && (
          <Button
            colorScheme="secondary"
            maxW="150px"
            onClick={generateProposals}
          >
            Generate Proposals
          </Button>
        )}
      </Stack>
    </Skeleton>
  );
}

const ViewWagerPage = () => {
  const { getCosmWasmClient } = useChain(env.CHAIN);
  const {
    query: { id },
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
      <Heading
        as="h1"
        fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
        fontWeight="extrabold"
        mb={3}
      >
        Wager {id}
      </Heading>
      {cosmwasmClient && (
        <ViewWagerPageContent cosmwasmClient={cosmwasmClient} />
      )}
    </Container>
  );
};

export default ViewWagerPage;
