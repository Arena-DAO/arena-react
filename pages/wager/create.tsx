import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from "@chakra-ui/form-control";
import { Container, Grid, GridItem, Heading, Stack } from "@chakra-ui/layout";
import {
  Button,
  Fade,
  IconButton,
  Input,
  InputGroup,
  InputRightAddon,
  InputRightElement,
  Select,
  Textarea,
  Tooltip,
  useBreakpointValue,
  useToast,
} from "@chakra-ui/react";
import { useChain } from "@cosmos-kit/react";
import { DaoDaoCoreQueryClient } from "@dao/DaoDaoCore.client";
import { InstantiateMsg as DaoDaoCoreInstantiateMsg } from "@dao/DaoDaoCore.types";
import { InstantiateMsg as ArenaEscrowInstantiateMsg } from "@arena/ArenaEscrow.types";
import { ArenaCoreQueryClient } from "@arena/ArenaCore.client";
import { ArenaWagerModuleClient } from "@arena/ArenaWagerModule.client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { z } from "zod";
import {
  AddressSchema,
  DueSchema,
  ExpirationSchema,
  convertToExpiration,
} from "~/helpers/SchemaHelpers";
import { toBinary } from "cosmwasm";
import { InstantiateMsg as DAOProposalMultipleInstantiateMsg } from "@dao/DaoProposalMultiple.types";
import { InstantiateMsg as DAOVotingCW4InstantiateMsg } from "@dao/DaoVotingCw4.types";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import moment from "moment-timezone";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import env from "config/env";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { WagerCreateRulesetTable } from "@components/pages/wager/create/RulesetTable";
import { WagerCreateDAOCard } from "@components/pages/wager/create/DAOCard";
import { WagerCreateTeamCard } from "@components/pages/wager/create/TeamCard";

const FormSchema = z.object({
  dao_address: AddressSchema,
  description: z.string().nonempty({ message: "Description is required" }),
  expiration: ExpirationSchema,
  name: z.string().nonempty({ message: "Name is required " }),
  rules: z.array(z.string().nonempty({ message: "Rule cannot be empty " })),
  ruleset: z.number().optional(),
  dues: z.array(DueSchema).nonempty({ message: "Dues cannot be empty" }),
});
export type FormValues = z.infer<typeof FormSchema>;

interface WagerFormProps {
  cosmwasmClient: CosmWasmClient;
}

function WagerForm({ cosmwasmClient }: WagerFormProps) {
  const router = useRouter();
  const toast = useToast();
  const { getSigningCosmWasmClient, address, isWalletConnected } = useChain(
    env.CHAIN
  );

  const formMethods = useForm<FormValues>({
    defaultValues: {
      dao_address: "",
      expiration: {
        expiration_units: "At Time",
        time: format(
          new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
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
    },
    resolver: zodResolver(FormSchema),
  });
  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = formMethods;
  useEffect(() => {
    if (router.query.dao as string | undefined)
      setValue("dao_address", router.query.dao as string);
  }, [router.query.dao, setValue]);

  const watchExpirationUnits = watch("expiration.expiration_units");

  const [arenaCoreAddr, setArenaCoreAddr] = useState<string | undefined>();

  const onRulesetSelect = (id: number | undefined) => {
    setValue("ruleset", id);
  };

  const {
    fields: duesFields,
    append: duesAppend,
    remove: duesRemove,
  } = useFieldArray({
    name: "dues",
    control,
  });

  const onSubmit = async (values: FormValues) => {
    let cosmwasmClient = await getSigningCosmWasmClient();

    if (!cosmwasmClient) {
      console.error("Could not get the CosmWasm client.");
      return;
    }

    try {
      const daoDaoCoreQuery = new DaoDaoCoreQueryClient(
        cosmwasmClient,
        values.dao_address
      );

      try {
        await daoDaoCoreQuery.config();
      } catch (e) {
        setError("dao_address", {
          message: "The given address is not a valid dao",
        });
        throw e;
      }

      if (!arenaCoreAddr) {
        setError("dao_address", {
          message: "The DAO does not have an Arena extension.",
        });
        return;
      }

      let arenaCoreClient = new ArenaCoreQueryClient(
        cosmwasmClient,
        arenaCoreAddr
      );

      let wager_module = await arenaCoreClient.queryExtension({
        msg: {
          competition_module: {
            key: env.WAGER_MODULE_KEY,
          },
        },
      });

      if (!wager_module) {
        setError("dao_address", {
          message:
            "The DAO's Arena extension does not have a wager module set.",
        });
        return;
      }

      let wagerModuleClient = new ArenaWagerModuleClient(
        cosmwasmClient,
        address!,
        wager_module
      );

      const msg = {
        description: values.description,
        expiration: convertToExpiration(values.expiration),
        name: values.name,
        rules: values.rules,
        ruleset: values.ruleset?.toString(),
        extension: {},
        competitionDao: {
          code_id: env.CODE_ID_DAO_CORE,
          label: "Arena Competition DAO",
          msg: toBinary({
            admin: values.dao_address,
            automatically_add_cw20s: true,
            automatically_add_cw721s: true,
            description: "A DAO for handling an Arena Competition",
            name: "Arena Competition DAO",
            proposal_modules_instantiate_info: [
              {
                code_id: env.CODE_ID_DAO_PROPOSAL_MULTIPLE,
                admin: { address: { addr: values.dao_address } },
                label: "DAO Proposal Multiple",
                msg: toBinary({
                  allow_revoting: false,
                  close_proposal_on_execution_failure: true,
                  max_voting_period: { time: 31557600 },
                  only_members_execute: true,
                  pre_propose_info: {
                    anyone_may_propose: {},
                  },
                  voting_strategy: {
                    single_choice: { quorum: { percent: "1" } },
                  },
                } as DAOProposalMultipleInstantiateMsg),
              },
            ],
            voting_module_instantiate_info: {
              code_id: env.CODE_ID_DAO_VOTING_CW4,
              admin: { address: { addr: values.dao_address } },
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
            lock_when_funded: true,
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
      if (id) {
        await wagerModuleClient.generateProposals({ id });

        toast({
          title: "Success",
          isClosable: true,
          status: "success",
          description: "The competition's proposals have been generated.",
        });

        router.push(`/wager/${values.dao_address}/${id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
      <Fade in={true}>
        <Stack>
          <FormControl isInvalid={!!errors.dao_address}>
            <FormLabel>DAO</FormLabel>
            <Input id="dao_address" {...register("dao_address")} />
            <FormErrorMessage>{errors.dao_address?.message}</FormErrorMessage>
          </FormControl>
          <WagerCreateDAOCard
            cosmwasmClient={cosmwasmClient}
            control={control}
          />
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
            gap="2"
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
                    <Input
                      type="datetime-local"
                      {...register("expiration.time")}
                    />
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
          <WagerCreateRulesetTable
            cosmwasmClient={cosmwasmClient}
            onRulesetSelect={onRulesetSelect}
            control={control}
            setError={setError}
            clearErrors={clearErrors}
            onArenaCoreLoaded={setArenaCoreAddr}
          />
          <FormControl isInvalid={!!errors.rules}>
            <FormLabel>Rules</FormLabel>
            <Controller
              control={control}
              name="rules"
              render={({ field: { onChange, value } }) => (
                <Stack>
                  {value?.map((_rule, ruleIndex) => (
                    <FormControl
                      key={ruleIndex}
                      isInvalid={!!errors.rules?.[ruleIndex]}
                    >
                      <InputGroup>
                        <Input {...register(`rules.${ruleIndex}`)} />
                        <InputRightElement>
                          <Tooltip label="Delete Rule">
                            <IconButton
                              aria-label="delete"
                              variant="ghost"
                              icon={<DeleteIcon />}
                              onClick={() =>
                                onChange([
                                  ...value.slice(0, ruleIndex),
                                  ...value.slice(ruleIndex + 1),
                                ])
                              }
                            />
                          </Tooltip>
                        </InputRightElement>
                      </InputGroup>
                      <FormErrorMessage>
                        {errors.rules?.[ruleIndex]?.message}
                      </FormErrorMessage>
                    </FormControl>
                  ))}
                  <Tooltip label="Add Rule">
                    <IconButton
                      variant="ghost"
                      colorScheme="secondary"
                      aria-label="Add Rule"
                      alignSelf="flex-start"
                      onClick={() => onChange([...value, ""])}
                      icon={<AddIcon />}
                    />
                  </Tooltip>
                </Stack>
              )}
            />
            <FormErrorMessage>{errors.rules?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.dues}>
            <FormLabel>Dues</FormLabel>
            <Stack>
              <FormProvider {...formMethods}>
                {duesFields.map((dues, dueIndex: number) => {
                  return (
                    <WagerCreateTeamCard
                      key={dues.id}
                      index={dueIndex}
                      cosmwasmClient={cosmwasmClient}
                      duesRemove={() => duesRemove(dueIndex)}
                    />
                  );
                })}
              </FormProvider>
            </Stack>
            <Tooltip label="Add Team">
              <IconButton
                mt="2"
                variant="ghost"
                colorScheme="secondary"
                aria-label="Add Team"
                onClick={() =>
                  duesAppend({
                    addr: "",
                    balance: {
                      cw20: [],
                      cw721: [],
                      native: [],
                    },
                  })
                }
                icon={<AddIcon />}
              />
            </Tooltip>
            <FormErrorMessage>{errors.dues?.message}</FormErrorMessage>
          </FormControl>
          <Button
            type="submit"
            colorScheme="secondary"
            isDisabled={!isWalletConnected}
            isLoading={isSubmitting}
            maxW="150px"
          >
            Submit
          </Button>
        </Stack>
      </Fade>
    </form>
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
      <Heading
        as="h1"
        fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
        fontWeight="extrabold"
        mb={3}
      >
        Create a Wager
      </Heading>
      {cosmwasmClient && <WagerForm cosmwasmClient={cosmwasmClient} />}
    </Container>
  );
};

export default CreateWagerPage;
