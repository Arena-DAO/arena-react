import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from "@chakra-ui/form-control";
import { Container, Heading, Stack } from "@chakra-ui/layout";
import { Input } from "@chakra-ui/react";
import { useChain } from "@cosmos-kit/react";
import { DaoCoreQueryClient } from "@dao/DaoCore.client";
import {
  Config,
  InstantiateMsg as DAOCoreInstantiateMsg,
} from "@dao/DaoCore.types";
import { InstantiateMsg as ArenaEscrowInstantiateMsg } from "@arena/ArenaEscrow.types";
import { ArenaCoreQueryClient } from "@arena/ArenaCore.client";
import { ArenaWagerModuleClient } from "@arena/ArenaWagerModule.client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  DAOAddressSchema,
  DurationSchema,
  ExpirationSchema,
  convertToDuration,
  convertToExpiration,
} from "~/helpers/SchemaHelpers";
import { toBinary } from "cosmwasm";
import { InstantiateMsg as DAOProposalMultipleInstantiateMsg } from "@dao/DaoProposalMultiple.types";
import { InstantiateMsg as DAOPreProposeMultipleInstantiateMsg } from "@dao/DaoPreProposeMultiple.types";
import { InstantiateMsg as DAOVotingCW4InstantiateMsg } from "@dao/DaoVotingCw4.types";
import { DAOCard } from "@components/DAOCard";
import { useEffect, useState } from "react";

const WagerForm = () => {
  const router = useRouter();
  const chainContext = useChain(process.env.NEXT_PUBLIC_CHAIN!);
  const daoAddressSchema = DAOAddressSchema(chainContext.chain.bech32_prefix);

  const validationSchema = z.object({
    dao: daoAddressSchema,
    description: z.string().nonempty(),
    expiration: ExpirationSchema,
    name: z.string().nonempty(),
    rules: z.string().array(),
    ruleset: z.number().optional(),
    max_voting_period: DurationSchema.required({ duration: true }),
    dues: z.array(
      z.object({
        addr: z.string().nonempty(),
        balance: z.object({
          cw20: z.array(
            z.object({
              address: z.string().nonempty(),
              amount: z.number().positive(),
            })
          ),
          cw721: z.array(
            z.object({
              addr: z.string().nonempty(),
              token_ids: z.array(z.string().nonempty()).min(1),
            })
          ),
          native: z.array(
            z.object({
              amount: z.number().positive(),
              denom: z.string().nonempty(),
            })
          ),
        }),
      })
    ),
  });

  type FormValues = z.infer<typeof validationSchema>;

  const {
    register,
    handleSubmit,
    control,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      dao: router.query.dao as string | undefined,
    },
    resolver: zodResolver(validationSchema),
  });

  const watchDAO = watch("dao");
  const [daoConfig, setDAOConfig] = useState<Config | undefined>();
  useEffect(() => {
    try {
      daoAddressSchema.parse(watchDAO);

      async function queryDAO() {
        let cosmwasmClient = await chainContext.getCosmWasmClient();

        let daoCoreQueryClient = new DaoCoreQueryClient(
          cosmwasmClient,
          watchDAO
        );

        let config = await daoCoreQueryClient.config();
        setDAOConfig(config);
      }

      queryDAO();
    } catch {
      setDAOConfig(undefined);
    }
  }, [watchDAO, daoAddressSchema, chainContext]);

  const onSubmit = async (values: FormValues) => {
    let cosmWasmClient = await chainContext.getSigningCosmWasmClient();
    let daoCoreClient = new DaoCoreQueryClient(cosmWasmClient, values.dao);

    let getItemResponse = await daoCoreClient.getItem({
      key: process.env.NEXT_PUBLIC_ITEM_KEY!,
    });
    if (!getItemResponse.item) {
      setError("dao", {
        message: "The DAO does not have an Arena extension.",
      });
      return;
    }

    let arenaCoreClient = new ArenaCoreQueryClient(
      cosmWasmClient,
      getItemResponse.item
    );

    let wager_module = await arenaCoreClient.queryExtension({
      msg: {
        competition_module: { key: process.env.NEXT_PUBLIC_WAGER_MODULE_KEY! },
      },
    });

    if (!wager_module) {
      setError("dao", {
        message: "The DAO's Arena extension does not have a wager module set.",
      });
    }

    // We need to create a dictionary of address/denom to decimal points

    let wagerModuleClient = new ArenaWagerModuleClient(
      cosmWasmClient,
      chainContext.address!,
      wager_module
    );

    await wagerModuleClient.createCompetition({
      description: values.description,
      expiration: convertToExpiration(values.expiration),
      name: values.name,
      rules: values.rules,
      ruleset: values.ruleset?.toString(),
      extension: {},
      competitionDao: {
        code_id: parseInt(process.env.NEXT_PUBLIC_CODE_ID_DAO_CORE!),
        label: "Arena Competition DAO",
        msg: toBinary({
          admin: values.dao,
          automatically_add_cw20s: false,
          automatically_add_cw721s: false,
          description: "A DAO for handling an Arena Competition",
          name: "Arena Competition DAO",
          proposal_modules_instantiate_info: [
            {
              code_id: parseInt(
                process.env.NEXT_PUBLIC_CODE_ID_DAO_PROPOSAL_MULTIPLE!
              ),
              admin: { address: { addr: values.dao } },
              label: "DAO Proposal Multiple",
              msg: toBinary({
                allow_revoting: false,
                close_proposal_on_execution_failure: true,
                max_voting_period: convertToDuration(values.max_voting_period),
                only_members_execute: true,
                pre_propose_info: {
                  module_may_propose: {
                    info: {
                      code_id: parseInt(
                        process.env.NEXT_PUBLIC_CODE_ID_DAO_PREPROPOSE_MULTIPLE!
                      ),
                      admin: { address: { addr: values.dao } },
                      label: "DAO PrePropose Multiple",
                      msg: toBinary({
                        extension: {},
                        open_proposal_submission: false,
                      } as DAOPreProposeMultipleInstantiateMsg),
                    },
                  },
                },
                voting_strategy: {
                  single_choice: { quorum: { percent: "1" } },
                },
              } as DAOProposalMultipleInstantiateMsg),
            },
          ],
          voting_module_instantiate_info: {
            code_id: parseInt(process.env.NEXT_PUBLIC_CODE_ID_DAO_VOTING_CW4!),
            admin: { address: { addr: values.dao } },
            label: "DAO Voting CW4",
            msg: toBinary({
              cw4_group_code_id: parseInt(
                process.env.NEXT_PUBLIC_CODE_ID_CW4_GROUP!
              ),
              initial_members: [],
            } as DAOVotingCW4InstantiateMsg),
          },
        } as DAOCoreInstantiateMsg),
      },
      escrow: {
        code_id: parseInt(process.env.NEXT_PUBLIC_CODE_ID_ESCROW!),
        label: "Arena Escrow",
        msg: "" /*toBinary({
          dues: values.dues,
          lock_when_funded: true,
        } as ArenaEscrowInstantiateMsg)*/,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl isInvalid={!!errors.dao}>
        <FormLabel>DAO</FormLabel>
        <Input id="dao" {...register("dao")} />
        <FormErrorMessage>{errors.dao?.message}</FormErrorMessage>
      </FormControl>
      {!!daoConfig && <DAOCard config={daoConfig} addr={watchDAO} my="2" />}
    </form>
  );
};

const CreateWagerPage = () => {
  return (
    <Container
      maxW={{ base: "100%", md: "75%", lg: "60%" }}
      centerContent
      pb={10}
    >
      <Heading
        as="h1"
        fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
        fontWeight="extrabold"
        mb={3}
      >
        Create a Wager
      </Heading>
      <Stack w="100%" spacing={4}>
        <WagerForm />
      </Stack>
    </Container>
  );
};

export default CreateWagerPage;
