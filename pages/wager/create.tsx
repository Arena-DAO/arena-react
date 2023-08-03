import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from "@chakra-ui/form-control";
import { Container, Grid, GridItem, Heading, Stack } from "@chakra-ui/layout";
import {
  Button,
  IconButton,
  Input,
  InputGroup,
  InputRightAddon,
  InputRightElement,
  Select,
  Textarea,
  useBreakpointValue,
} from "@chakra-ui/react";
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
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  DAOAddressSchema,
  DurationSchema,
  ExpirationSchema,
  convertToDuration,
  convertToExpiration,
} from "~/helpers/SchemaHelpers";
import { fromBinary, toBinary } from "cosmwasm";
import { InstantiateMsg as DAOProposalMultipleInstantiateMsg } from "@dao/DaoProposalMultiple.types";
import { InstantiateMsg as DAOPreProposeMultipleInstantiateMsg } from "@dao/DaoPreProposeMultiple.types";
import { InstantiateMsg as DAOVotingCW4InstantiateMsg } from "@dao/DaoVotingCw4.types";
import { DAOCard } from "@components/DAOCard";
import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import moment from "moment-timezone";
import { BsPlus } from "react-icons/bs";
import { FiDelete } from "react-icons/fi";
import { Ruleset } from "@arena/ArenaCore.types";

const WagerForm = () => {
  const router = useRouter();
  const chainContext = useChain(process.env.NEXT_PUBLIC_CHAIN!);
  const daoAddressSchema = DAOAddressSchema(chainContext.chain.bech32_prefix);

  const validationSchema = z.object({
    dao: daoAddressSchema,
    description: z.string().nonempty({ message: "Description is required" }),
    expiration: ExpirationSchema,
    name: z.string().nonempty({ message: "Name is required " }),
    rules: z.string().nonempty({ message: "Rule cannot be empty " }).array(),
    ruleset: z.number().optional(),
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
      expiration: {
        expiration_units: "At Time",
        time: format(
          new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          "yyyy-MM-dd'T'HH:mm"
        ),
        timezone: moment.tz.guess(),
      },
      rules: [],
    },
    resolver: zodResolver(validationSchema),
  });

  const watchExpirationUnits = watch("expiration.expiration_units");

  const watchDAO = watch("dao");
  const [daoConfig, setDAOConfig] = useState<Config | undefined>();
  const [arenaCoreAddr, setArenaCoreAddr] = useState<string | undefined>();
  const [rulesets, setRulesets] = useState<Ruleset[] | undefined>();
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
  useEffect(() => {
    if (daoConfig) {
      try {
        async function queryArenaCoreAddr() {
          let cosmwasmClient = await chainContext.getCosmWasmClient();

          let daoCoreQueryClient = new DaoCoreQueryClient(
            cosmwasmClient,
            watchDAO
          );

          let getItemResponse = await daoCoreQueryClient.getItem({
            key: process.env.NEXT_PUBLIC_ITEM_KEY!,
          });

          if (!getItemResponse.item) {
            setError("dao", {
              message: "The DAO does not have an Arena extension.",
            });
          }
          setArenaCoreAddr(getItemResponse.item ?? undefined);
        }

        queryArenaCoreAddr();
      } catch {
        setArenaCoreAddr(undefined);
      }
    } else setArenaCoreAddr(undefined);
  }, [daoConfig, chainContext, setError, watchDAO]);

  const getRulesets = useCallback(
    async (arenaCoreAddr: string, skip: number | null) => {
      try {
        let cosmwasmClient = await chainContext.getCosmWasmClient();
        let arenaCoreQueryClient = new ArenaCoreQueryClient(
          cosmwasmClient,
          arenaCoreAddr
        );
        let rulesets = fromBinary(
          await arenaCoreQueryClient.queryExtension({
            msg: { rulesets: { skip } },
          })
        );

        setRulesets(rulesets);
      } catch {
        setRulesets(undefined);
      }
    },
    [chainContext]
  );
  useEffect(() => {
    if (arenaCoreAddr) {
      try {
        getRulesets(arenaCoreAddr, null);
      } catch {
        setRulesets(undefined);
      }
    } else setRulesets(undefined);
  }, [arenaCoreAddr, chainContext, getRulesets]);

  const onSubmit = async (values: FormValues) => {
    let cosmWasmClient = await chainContext.getSigningCosmWasmClient();

    if (!cosmWasmClient) {
      console.error("Could not get the CosmWasm client.");
      return;
    }

    try {
      if (!arenaCoreAddr) {
        setError("dao", {
          message: "The DAO does not have an Arena extension.",
        });
        return;
      }

      let arenaCoreClient = new ArenaCoreQueryClient(
        cosmWasmClient,
        arenaCoreAddr
      );

      let wager_module = await arenaCoreClient.queryExtension({
        msg: {
          competition_module: {
            key: process.env.NEXT_PUBLIC_WAGER_MODULE_KEY!,
          },
        },
      });

      if (!wager_module) {
        setError("dao", {
          message:
            "The DAO's Arena extension does not have a wager module set.",
        });
      }

      // We need to have a dictionary of address/denom to decimal points

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
                  max_voting_period: { time: Number.MAX_SAFE_INTEGER },
                  only_members_execute: true,
                  pre_propose_info: {
                    module_may_propose: {
                      info: {
                        code_id: parseInt(
                          process.env
                            .NEXT_PUBLIC_CODE_ID_DAO_PREPROPOSE_MULTIPLE!
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
              code_id: parseInt(
                process.env.NEXT_PUBLIC_CODE_ID_DAO_VOTING_CW4!
              ),
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
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl isInvalid={!!errors.dao}>
        <FormLabel>DAO</FormLabel>
        <Input id="dao" {...register("dao")} />
        <FormErrorMessage>{errors.dao?.message}</FormErrorMessage>
      </FormControl>
      {!!daoConfig && <DAOCard config={daoConfig} addr={watchDAO} my="2" />}
      <FormControl isInvalid={!!errors.name}>
        <FormLabel>Name</FormLabel>
        <Input id="name" {...register("name")} />
        <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={!!errors.description}>
        <FormLabel>Description</FormLabel>
        <Textarea id="description" {...register("description")} />
        <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
      </FormControl>
      <Grid
        templateColumns={useBreakpointValue({
          base: "1fr",
          sm: "repeat(2, 1fr)",
          xl: "repeat(4, 1fr)",
        })}
        gap={1}
        alignItems="flex-start"
      >
        <GridItem>
          <FormControl
            isInvalid={
              !!errors.expiration?.expiration_units || !!errors.expiration
            }
          >
            <FormLabel>Expiration</FormLabel>
            <Select {...register("expiration.expiration_units")}>
              <option value="At Time">At Time</option>
              <option value="At Height">At Height</option>
              <option value="Never">Never</option>
            </Select>
            <FormErrorMessage>
              {errors.expiration?.expiration_units?.message ??
                errors.expiration?.message}
            </FormErrorMessage>
          </FormControl>
        </GridItem>
        {watchExpirationUnits == "At Time" && (
          <>
            <GridItem>
              <FormControl isInvalid={!!errors.expiration?.time}>
                <FormLabel>Time</FormLabel>
                <Input type="datetime-local" {...register("expiration.time")} />
                <FormErrorMessage>
                  {errors.expiration?.time?.message}
                </FormErrorMessage>
              </FormControl>
            </GridItem>
            <GridItem>
              <FormControl isInvalid={!!errors.expiration?.timezone}>
                <FormLabel>Timezone</FormLabel>
                <Select {...register("expiration.timezone")}>
                  {moment.tz.names().map((timezone) => (
                    <option key={timezone} value={timezone}>
                      {timezone}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>
                  {errors.expiration?.timezone?.message}
                </FormErrorMessage>
              </FormControl>
            </GridItem>
          </>
        )}
        {watchExpirationUnits == "At Height" && (
          <GridItem>
            <FormControl isInvalid={!!errors.expiration?.height}>
              <FormLabel>Height</FormLabel>
              <InputGroup>
                <Input
                  type="number"
                  {...register("expiration.height", {
                    setValueAs: (x) => (x === "" ? undefined : parseInt(x)),
                  })}
                />
                <InputRightAddon>blocks</InputRightAddon>
              </InputGroup>
              <FormErrorMessage>
                {errors.expiration?.height?.message}
              </FormErrorMessage>
            </FormControl>
          </GridItem>
        )}
      </Grid>
      <FormControl>
        <FormLabel>Rules</FormLabel>
        <Controller
          control={control}
          name="rules"
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Stack spacing={4}>
              {value?.map((_rule, ruleIndex) => (
                <FormControl
                  key={ruleIndex}
                  isInvalid={!!errors.rules?.[ruleIndex]}
                >
                  <InputGroup>
                    <Input
                      onBlur={onBlur}
                      onChange={(e) => {
                        const newValue = [...value];
                        newValue[ruleIndex] = e.target.value;
                        onChange(newValue);
                      }}
                      value={value[ruleIndex]}
                      ref={ref}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label="delete"
                        variant="ghost"
                        icon={<FiDelete />}
                        onClick={() =>
                          onChange([
                            ...value.slice(0, ruleIndex),
                            ...value.slice(ruleIndex + 1),
                          ])
                        }
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>
                    {errors.rules?.[ruleIndex]?.message}
                  </FormErrorMessage>
                </FormControl>
              ))}
              <IconButton
                variant="outline"
                colorScheme="secondary"
                aria-label="Add Rule"
                alignSelf="flex-start"
                onClick={() => onChange([...value, ""])}
                icon={<BsPlus />}
              />
            </Stack>
          )}
        />
        <FormErrorMessage>{errors.rules?.message}</FormErrorMessage>
      </FormControl>
      <Button
        mt={6}
        type="submit"
        colorScheme="secondary"
        isDisabled={!chainContext.isWalletConnected}
        isLoading={isSubmitting}
      >
        Submit
      </Button>
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
