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
import { ArenaWagerModuleQueryClient } from "@arena/ArenaWagerModule.client";
import { Button, Skeleton, useDisclosure, useToast } from "@chakra-ui/react";
import { statusColors } from "~/helpers/ArenaHelpers";
import { WagerViewDuesDisplay } from "@components/pages/wager/view/DuesDisplay";
import { AddressSchema } from "~/helpers/SchemaHelpers";
import { WagerViewBalanceCard } from "@components/pages/wager/view/BalanceCard";
import { WagerViewTotalBalanceCard } from "@components/pages/wager/view/TotalBalanceCard";
import {
  WagerViewProposalPromptModal,
  WagerViewProposalPromptModalAction,
} from "@components/pages/wager/view/ProposalPromptModal";
import { CompetitionStatus } from "@arena/ArenaWagerModule.types";

interface ViewWagerPageContentProps {
  cosmwasmClient: CosmWasmClient;
  dao: string;
  id: string;
}

function ViewWagerPageContent({
  cosmwasmClient,
  dao,
  id,
}: ViewWagerPageContentProps) {
  const toast = useToast();
  const { address } = useChain(env.CHAIN);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isValidAddress = useMemo(() => {
    return !!dao && AddressSchema.safeParse(dao).success;
  }, [dao]);
  const [promptAction, setPromptAction] =
    useState<WagerViewProposalPromptModalAction>("Generate Proposals");
  const { data: itemData, isFetched: isItemFetched } =
    useDaoDaoCoreGetItemQuery({
      client: new DaoDaoCoreQueryClient(cosmwasmClient, dao),
      args: { key: env.ARENA_ITEM_KEY },
      options: { enabled: isValidAddress, staleTime: Infinity },
    });
  const { data: moduleData, isFetched: isModuleFetched } =
    useArenaCoreQueryExtensionQuery({
      client: new ArenaCoreQueryClient(cosmwasmClient, itemData?.item!),
      args: { msg: { competition_module: { key: env.WAGER_MODULE_KEY } } },
      options: {
        enabled: isItemFetched && !!itemData && !!itemData.item,
        staleTime: Infinity,
      },
    });
  const query = useArenaWagerModuleCompetitionQuery({
    client: new ArenaWagerModuleQueryClient(cosmwasmClient, moduleData!),
    args: { id: id },
    options: {
      enabled: !!id && !isNaN(parseInt(id)) && isModuleFetched && !!moduleData,
      staleTime: 0,
      retry: false,
    },
  });
  const [data, setData] = useState(query.data);
  useEffect(() => {
    setData(query.data);
  }, [query.data]);

  const [balanceChanged, setBalanceChanged] = useState<number>(0);
  useEffect(() => {
    if (query.isError)
      toast({
        title: "Error",
        isClosable: false,
        status: "error",
        description: `Could not retrieve competition ${id}`,
      });
  }, [query.isError, toast, id]);
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
  useEffect(() => {}, [data?.has_generated_proposals]);
  const notifyBalancesChanged = useCallback(
    () => setBalanceChanged((prev) => prev + 1),
    []
  );
  const notifyIsActive = useCallback(() => {
    if (data) data.status = "active";
  }, [data]);

  if (query.isError || !isValidAddress) {
    return null;
  }
  return (
    <Skeleton isLoaded={!query.isLoading} w="100%">
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
        {data && data.status != "inactive" && (
          <>
            <WagerViewDuesDisplay
              cosmwasmClient={cosmwasmClient}
              escrow_addr={data.escrow}
              balanceChanged={balanceChanged}
              notifyBalancesChanged={notifyBalancesChanged}
              wager_id={data.id}
              notifyIsActive={notifyIsActive}
            />
            {address && (
              <WagerViewBalanceCard
                address={address}
                cosmwasmClient={cosmwasmClient}
                escrow_address={data.escrow}
                status={data.status}
                notifyBalancesChanged={notifyBalancesChanged}
                balanceChanged={balanceChanged}
              />
            )}
            <WagerViewTotalBalanceCard
              cosmwasmClient={cosmwasmClient}
              escrow_address={data.escrow}
              balanceChanged={balanceChanged}
            />
          </>
        )}
        {!data?.has_generated_proposals && (
          <Button
            colorScheme="secondary"
            maxW="150px"
            onClick={() => {
              setPromptAction("Generate Proposals");
              onOpen();
            }}
          >
            Generate Proposals
          </Button>
        )}
        {data?.status == "active" && data?.is_expired && (
          <Button
            colorScheme="secondary"
            maxW="150px"
            onClick={() => {
              setPromptAction("Jail Wager");
              onOpen();
            }}
          >
            Jail Wager
          </Button>
        )}
        {moduleData && (
          <WagerViewProposalPromptModal
            id={id}
            module_addr={moduleData}
            isOpen={isOpen}
            onClose={onClose}
            action={promptAction}
            setJailedStatus={() => {
              setData((prevData) => {
                if (prevData) {
                  return { ...prevData, status: "jailed" };
                }
                return prevData;
              });
            }}
            setHasGeneratedProposals={() => {
              setData((prevData) => {
                if (prevData) {
                  return { ...prevData, has_generated_proposals: true };
                }
                return prevData;
              });
            }}
          />
        )}
      </Stack>
    </Skeleton>
  );
}

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
      <Heading
        as="h1"
        fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
        fontWeight="extrabold"
        mb={3}
      >
        Wager {id}
      </Heading>
      {cosmwasmClient && typeof dao === "string" && typeof id === "string" && (
        <ViewWagerPageContent
          cosmwasmClient={cosmwasmClient}
          dao={dao}
          id={id}
        />
      )}
    </Container>
  );
};

export default ViewWagerPage;
