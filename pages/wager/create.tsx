import { Box, Container, Heading, Stack } from "@chakra-ui/layout";
import { Button, useToast } from "@chakra-ui/react";
import { useChain } from "@cosmos-kit/react";
import { InstantiateMsg as DaoDaoCoreInstantiateMsg } from "@dao/DaoDaoCore.types";
import { InstantiateMsg as ArenaEscrowInstantiateMsg } from "@arena/ArenaEscrow.types";
import { ArenaWagerModuleClient } from "@arena/ArenaWagerModule.client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { FormProvider, useForm } from "react-hook-form";
import {
  convertToExpiration,
  convertToRules,
  convertToRulesets,
} from "~/helpers/SchemaHelpers";
import { InstantiateMsg as DAOProposalSingleInstantiateMsg } from "@dao/DaoProposalSingle.types";
import { InstantiateMsg as DAOVotingCW4InstantiateMsg } from "@dao/DaoVotingCw4.types";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import moment from "moment-timezone";
import { CosmWasmClient, toBinary } from "@cosmjs/cosmwasm-stargate";
import env from "config/env";
import { CreateCompetitionSchema } from "@config/schemas";
import CreateCompetitionForm, {
  CreateCompetitionFormValues,
} from "@components/competition/CreateCompetitionForm";
import { CategoryMap } from "@config/categories";

interface WagerFormProps {
  cosmwasmClient: CosmWasmClient;
}

function WagerForm({ cosmwasmClient }: WagerFormProps) {
  const router = useRouter();
  const category = router.query.category;
  if (!category) throw "No category provided";
  const categoryItem = CategoryMap.get(category as string);
  if (!categoryItem || !("category_id" in categoryItem))
    throw "No category_id found";
  const toast = useToast();
  const { getSigningCosmWasmClient, address, isWalletConnected } = useChain(
    env.CHAIN
  );

  const formMethods = useForm<CreateCompetitionFormValues>({
    defaultValues: {
      expiration: {
        expiration_units: "At Time",
        time: format(
          new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default to 2 weeks from now
          "yyyy-MM-dd'T'HH:mm"
        ),
        timezone: moment.tz.guess(),
      },
      rules: [],
      dues: [
        {
          addr: address,
          balance: {
            cw20: [],
            cw721: [],
            native: [],
          },
        },
        {
          balance: {
            cw20: [],
            cw721: [],
            native: [],
          },
        },
      ],
      competition_dao_name: "Arena Competition DAO - " + categoryItem.title,
      competition_dao_description:
        "A DAO for handling an Arena Competition in " +
        categoryItem.title +
        ".",
    },
    resolver: zodResolver(CreateCompetitionSchema),
  });
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = formMethods;

  const onSubmit = async (values: CreateCompetitionFormValues) => {
    try {
      let cosmwasmClient = await getSigningCosmWasmClient();
      if (!cosmwasmClient) throw "Could not get the CosmWasm client";
      if (!address) throw "Could not get user address";

      let wagerModuleClient = new ArenaWagerModuleClient(
        cosmwasmClient,
        address,
        env.ARENA_WAGER_MODULE_ADDRESS
      );

      const msg = {
        categoryId: categoryItem.category_id!,
        description: values.description,
        expiration: convertToExpiration(values.expiration),
        name: values.name,
        rules: convertToRules(values.rules),
        rulesets: convertToRulesets(values.rulesets),
        instantiateExtension: {},
        competitionDao: {
          code_id: env.CODE_ID_DAO_CORE,
          label: "Arena Competition DAO",
          msg: toBinary({
            admin: env.ARENA_DAO_ADDRESS,
            automatically_add_cw20s: true,
            automatically_add_cw721s: true,
            description: values.competition_dao_description,
            name: values.competition_dao_name,
            proposal_modules_instantiate_info: [
              {
                code_id: env.CODE_ID_DAO_PROPOSAL_SINGLE,
                label: "DAO Proposal Single",
                msg: toBinary({
                  allow_revoting: false,
                  close_proposal_on_execution_failure: true,
                  max_voting_period: {
                    time: env.DEFAULT_TEAM_VOTING_DURATION_TIME,
                  },
                  only_members_execute: true,
                  pre_propose_info: {
                    anyone_may_propose: {}, // Ideally want a module_can_propose and module_sender
                  },
                  threshold: {
                    absolute_percentage: { percentage: { percent: "1" } },
                  },
                } as DAOProposalSingleInstantiateMsg),
              },
            ],
            voting_module_instantiate_info: {
              code_id: env.CODE_ID_DAO_VOTING_CW4,
              label: "DAO Voting CW4",
              msg: toBinary({
                cw4_group_code_id: env.CODE_ID_CW4_GROUP,
                initial_members: values.dues.map((x) => ({
                  addr: x.addr,
                  weight: 1,
                })),
              } as DAOVotingCW4InstantiateMsg),
            },
          } as DaoDaoCoreInstantiateMsg),
        },
        escrow: {
          code_id: env.CODE_ID_ESCROW,
          label: "Arena Escrow",
          msg: toBinary({
            dues: values.dues,
          } as ArenaEscrowInstantiateMsg),
        },
      };

      let result = await wagerModuleClient.createCompetition(msg);

      toast({
        title: "Success",
        isClosable: true,
        status: "success",
        description: "The competition has been created.",
      });

      let id;
      for (let event of result.events) {
        for (let attribute of event.attributes) {
          if (attribute.key === "id") {
            id = attribute.value;
            break;
          }
        }
        if (id) break;
      }

      if (id) router.push(`/wager/view?category=${category}&id=${id}`);
    } catch (e: any) {
      console.error(e);
      toast({
        status: "error",
        title: "Error",
        description: e.toString(),
        isClosable: true,
      });
    }
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <CreateCompetitionForm
            category_id={categoryItem.category_id!}
            cosmwasmClient={cosmwasmClient}
          />
          <Box mt="2">
            <Button
              type="submit"
              isDisabled={!isWalletConnected}
              isLoading={isSubmitting}
            >
              Submit
            </Button>
          </Box>
        </Stack>
      </form>
    </FormProvider>
  );
}

const CreateWagerPage = () => {
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

  return (
    <Container maxW={{ base: "full", md: "5xl" }} centerContent pb={10}>
      <Heading>Create a Wager</Heading>
      <Box w="100%">
        {cosmwasmClient && <WagerForm cosmwasmClient={cosmwasmClient} />}
      </Box>
    </Container>
  );
};

export default CreateWagerPage;
