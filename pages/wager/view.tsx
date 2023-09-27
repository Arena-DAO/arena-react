import {
  Badge,
  Box,
  Container,
  Heading,
  List,
  ListItem,
  ListProps,
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
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Fade,
  Skeleton,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { statusColors } from "~/helpers/ArenaHelpers";
import { AddressSchema } from "~/helpers/SchemaHelpers";
import {
  WagerViewProposalPromptModal,
  WagerViewProposalPromptModalAction,
} from "@components/pages/wager/view/ProposalPromptModal";
import { WagerViewEscrowDisplay } from "@components/pages/wager/view/EscrowDisplay";
import { CompetitionStatus } from "@arena/ArenaWagerModule.types";
import { CompetitionModuleResponse } from "@arena/ArenaCore.types";
import { WagerViewPresetDistributionModal } from "@components/pages/wager/view/PresetDistributionModal";
import { RulesetDisplay } from "@components/pages/wager/view/RulesetDisplay";

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
  const { address } = useChain(env.CHAIN);
  const toast = useToast();
  const {
    isOpen: isOpenProposalModal,
    onOpen: onOpenProposalModal,
    onClose: onCloseProposalModal,
  } = useDisclosure();
  const {
    isOpen: isOpenPresetModal,
    onOpen: onOpenPresetModal,
    onClose: onClosePresetModal,
  } = useDisclosure();
  const isValidAddress = useMemo(() => {
    return !!dao && AddressSchema.safeParse(dao).success;
  }, [dao]);
  const [promptAction, setPromptAction] =
    useState<WagerViewProposalPromptModalAction>("Propose Result");
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
    client: new ArenaWagerModuleQueryClient(
      cosmwasmClient,
      (moduleData as unknown as CompetitionModuleResponse)?.addr
    ),
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
  const notifyStatusChanged = useCallback(
    (new_status: CompetitionStatus) =>
      setData((prevData) => {
        if (prevData) {
          return { ...prevData, status: new_status };
        }
        return prevData;
      }),
    []
  );
  const notifyHasGeneratedProposals = useCallback(
    () =>
      setData((prevData) => {
        if (prevData) {
          return { ...prevData, has_generated_proposals: true };
        }
        return prevData;
      }),
    []
  );

  const listProps: ListProps = { spacing: 2 };

  if (query.isError || !isValidAddress || !data) {
    return null;
  }
  return (
    <Fade in={true}>
      <Skeleton isLoaded={!query.isLoading}>
        <Stack>
          <DAOCard address={data.dao} cosmwasmClient={cosmwasmClient} />
          <Heading>
            {data.name}{" "}
            <Badge
              variant="solid"
              ml={1}
              colorScheme={statusColors[data.status || "inactive"]}
            >
              {data.status}
            </Badge>
          </Heading>
          <Text>{data.description}</Text>
          {(data.rulesets.length > 0 || data.rules.length > 0) && (
            <Card>
              <CardHeader pb="0">
                <Heading mb="0" size="md">
                  Rules
                </Heading>
              </CardHeader>
              <CardBody>
                <Stack>
                  {data.rulesets.map((x) => (
                    <RulesetDisplay
                      key={x}
                      cosmwasmClient={cosmwasmClient}
                      arena_core_addr={itemData!.item!}
                      ruleset_id={x}
                      listProps={listProps}
                    />
                  ))}
                  {data.rules.length > 0 && (
                    <List {...listProps}>
                      {data.rules.map((rule, idx) => (
                        <ListItem key={idx}>{rule}</ListItem>
                      ))}
                    </List>
                  )}
                </Stack>
              </CardBody>
            </Card>
          )}
          {data.status != "inactive" && data.escrow && (
            <WagerViewEscrowDisplay
              cosmwasmClient={cosmwasmClient}
              escrow_addr={data.escrow}
              wager_id={data.id}
              wager_status={data.status}
              notifyIsActive={() => notifyStatusChanged("active")}
            />
          )}
          <ButtonGroup overflowX="auto" scrollPaddingBottom="0">
            {data.status !== "inactive" && (
              <>
                {!data.has_generated_proposals && (
                  <Button
                    minW="150px"
                    onClick={() => {
                      setPromptAction("Propose Result");
                      onOpenProposalModal();
                    }}
                  >
                    Propose Result
                  </Button>
                )}
                <Button minW="200px" onClick={() => onOpenPresetModal()}>
                  Set Preset Distribution
                </Button>
              </>
            )}
            {data.status == "active" && data.is_expired && (
              <Button
                minW="150px"
                onClick={() => {
                  setPromptAction("Jail Wager");
                  onOpenProposalModal();
                }}
              >
                Jail Wager
              </Button>
            )}
          </ButtonGroup>
          <WagerViewProposalPromptModal
            id={id}
            module_addr={
              (moduleData as unknown as CompetitionModuleResponse).addr
            }
            cosmwasmClient={cosmwasmClient}
            isOpen={isOpenProposalModal}
            onClose={onCloseProposalModal}
            action={promptAction}
            setJailedStatus={() => notifyStatusChanged("jailed")}
            setHasGeneratedProposals={() => notifyHasGeneratedProposals()}
          />
          {address && data.escrow && (
            <WagerViewPresetDistributionModal
              escrow_addr={data.escrow}
              isOpen={isOpenPresetModal}
              onClose={onClosePresetModal}
              cosmwasmClient={cosmwasmClient}
              address={address}
            />
          )}
        </Stack>
      </Skeleton>
    </Fade>
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
      <Heading>Wager {id}</Heading>
      <Box w="100%">
        {cosmwasmClient &&
          typeof dao === "string" &&
          typeof id === "string" && (
            <ViewWagerPageContent
              cosmwasmClient={cosmwasmClient}
              dao={dao}
              id={id}
            />
          )}
      </Box>
    </Container>
  );
};

export default ViewWagerPage;
