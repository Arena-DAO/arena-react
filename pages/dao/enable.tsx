import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Container,
  Fade,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputRightAddon,
  InputRightElement,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Textarea,
  Tooltip,
  useBreakpointValue,
  useToast,
  Text,
} from "@chakra-ui/react";
import {
  useForm,
  useFieldArray,
  Control,
  useWatch,
  FormProvider,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  InstantiateMsg as ArenaCoreInstantiateMsg,
  NewRuleset,
} from "~/ts-codegen/arena/ArenaCore.types";
import { BsPercent } from "react-icons/bs";
import { useChain } from "@cosmos-kit/react";
import { ExecuteMsg as DaoDaoCoreExecuteMsg } from "@dao/DaoDaoCore.types";
import { DaoProposalSingleClient } from "@dao/DaoProposalSingle.client";
import { InstantiateMsg as ArenaWagerModuleInstantiateMsg } from "@arena/ArenaWagerModule.types";
import { InstantiateMsg as DAOProposalSingleInstantiateMsg } from "@dao/DaoProposalSingle.types";
import { getProposalConfig } from "~/helpers/DAOHelpers";
import { DaoPreProposeSingleClient } from "@dao/DaoPreProposeSingle.client";
import { convertToDuration, convertToRules } from "~/helpers/SchemaHelpers";
import { useEffect, useState } from "react";
import { DAOCard } from "@components/cards/DAOCard";
import { CosmWasmClient, toBinary } from "@cosmjs/cosmwasm-stargate";
import env from "@config/env";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { DaoDaoCoreQueryClient } from "@dao/DaoDaoCore.client";
import { DAOEnableRulesetRules } from "@components/pages/dao/enable/RulesetRules";
import {
  AddressSchema,
  DurationSchema,
  PercentageThresholdSchema,
  RulesSchema,
} from "@config/schemas";

const FormSchema = z
  .object({
    dao_address: AddressSchema,
    //Dao Proposal Multiple Properties
    max_voting_duration: DurationSchema.required({ duration: true }),
    min_voting_duration: DurationSchema,
    allow_revoting: z.boolean(),
    close_proposal_on_execution_failure: z.boolean(),
    only_members_execute: z.boolean(),
    quorum: PercentageThresholdSchema,
    //Arena Core Properties
    rulesets: z
      .array(
        z.object({
          description: z.string().nonempty("Ruleset description is required"),
          is_enabled: z.boolean().default(true),
          rules: RulesSchema.refine((rules) => rules.length > 0, {
            message: "At least one rule is required",
          }),
        })
      )
      .optional(),
    tax: z
      .number()
      .min(0, "Tax must be between 0 and 100%")
      .max(100, "Tax must be between 0 and 100%"),
  })
  .required();
export type FormValues = z.infer<typeof FormSchema>;

interface EnableFormDAOCardProps {
  cosmwasmClient: CosmWasmClient;
  control: Control<FormValues>;
}

function EnableFormDAOCard({
  cosmwasmClient,
  control,
}: EnableFormDAOCardProps) {
  let watchDAOAddress = useWatch({ control, name: "dao_address" });

  if (!AddressSchema.safeParse(watchDAOAddress).success) return null;
  return <DAOCard address={watchDAOAddress} cosmwasmClient={cosmwasmClient} />;
}

interface EnableFormProps {
  cosmwasmClient: CosmWasmClient;
}

function EnableForm({ cosmwasmClient }: EnableFormProps) {
  const { address, getSigningCosmWasmClient, isWalletConnected } = useChain(
    env.CHAIN
  );
  const toast = useToast();

  const formMethods = useForm<FormValues>({
    defaultValues: {
      dao_address: "",
      rulesets: [],
      tax: env.DEFAULT_ARENA_TAX,
      allow_revoting: false,
      close_proposal_on_execution_failure: true,
      max_voting_duration: { duration: 1209600, duration_units: "Time" }, //2 weeks in seconds
      min_voting_duration: { duration_units: "Time" },
      only_members_execute: false,
      quorum: { percentage_threshold: "Majority" },
    },
    resolver: zodResolver(FormSchema),
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = formMethods;

  const watchMinVotingDurationUnits = watch(
    "min_voting_duration.duration_units"
  );
  const watchMaxVotingDurationUnits = watch(
    "max_voting_duration.duration_units"
  );
  const watchPercentageThreshold = watch("quorum.percentage_threshold");

  const {
    fields: rulesetsFields,
    append: rulesetsAppend,
    remove: rulesetsRemove,
  } = useFieldArray({
    name: "rulesets",
    control,
  });

  const onSubmit = async (values: FormValues) => {
    try {
      let cosmWasmClient = await getSigningCosmWasmClient();
      if (!cosmWasmClient) throw "Could not get the CosmWasm client";

      const daoDaoCoreQuery = new DaoDaoCoreQueryClient(
        cosmwasmClient,
        values.dao_address
      );

      await daoDaoCoreQuery.config();

      const proposalConfig = await getProposalConfig(
        cosmWasmClient,
        values.dao_address,
        "dao-proposal-single",
        address!
      );

      if (!proposalConfig) {
        throw "The dao does not have an accessible single proposal module available.";
      }

      let arena_wager_module_instantiate = {
        code_id: env.CODE_ID_WAGER_MODULE,
        label: "Arena Wager Module",
        msg: toBinary({
          key: env.WAGER_MODULE_KEY,
          description: "The Arena Protocol Wager Module",
          extension: {},
        } as ArenaWagerModuleInstantiateMsg),
        admin: { core_module: {} },
      };

      let arena_core_instantiate = {
        code_id: env.CODE_ID_ARENA_CORE,
        label: "Arena Core",
        msg: toBinary({
          open_proposal_submission: false,
          extension: {
            tax: (values.tax / 100).toString(),
            rulesets: values.rulesets.map((x) => {
              return {
                description: x.description,
                rules: convertToRules(x.rules),
              } as NewRuleset;
            }),
            competition_modules_instantiate_info: [
              arena_wager_module_instantiate,
            ],
          },
        } as ArenaCoreInstantiateMsg),
        admin: { core_module: {} },
      };

      let dao_proposal_single_instantiate = {
        code_id: env.CODE_ID_DAO_PROPOSAL_SINGLE,
        label: "Arena Proposal Single Module",
        msg: toBinary({
          allow_revoting: values.allow_revoting,
          close_proposal_on_execution_failure:
            values.close_proposal_on_execution_failure,
          max_voting_period: convertToDuration(values.max_voting_duration),
          min_voting_period:
            !values.min_voting_duration.duration ||
            values.min_voting_duration.duration == 0
              ? undefined
              : convertToDuration(values.min_voting_duration),
          only_members_execute: values.only_members_execute,
          pre_propose_info: {
            module_may_propose: { info: arena_core_instantiate },
          },
          threshold: {
            absolute_percentage: {
              percentage:
                values.quorum.percentage_threshold == "Majority"
                  ? { majority: {} }
                  : { percent: values.quorum.percent },
            },
          },
        } as DAOProposalSingleInstantiateMsg),
        admin: { core_module: {} },
      };

      const executeMsg: DaoDaoCoreExecuteMsg = {
        update_proposal_modules: {
          to_add: [dao_proposal_single_instantiate],
          to_disable: [],
        },
      };

      let cosmosMsg = {
        wasm: {
          execute: {
            contract_addr: values.dao_address,
            msg: toBinary(executeMsg),
            funds: [],
          },
        },
      };

      let proposal_description =
        "Enabling the Arena Protocol extension provides a framework for organizing and managing decentralized competitions, allowing for fair and transparent competition validation. By enabling the extension, participants can compete against each other in a trustless environment, and the DAO can ensure that the competition is fair and secure.";
      let proposal_title = "Enable the Arena Protocol extension.";
      if (proposalConfig.type == "proposal_module") {
        let daoProposalClient = new DaoProposalSingleClient(
          cosmWasmClient,
          address!,
          proposalConfig.addr
        );

        await daoProposalClient.propose({
          title: proposal_title,
          description: proposal_description,
          msgs: [cosmosMsg],
        });
      } else if (proposalConfig.type == "prepropose") {
        let preProposeClient = new DaoPreProposeSingleClient(
          cosmWasmClient,
          address!,
          proposalConfig.addr
        );

        await preProposeClient.propose(
          {
            msg: {
              propose: {
                title: proposal_title,
                description: proposal_description,
                msgs: [cosmosMsg],
              },
            },
          },
          undefined,
          undefined,
          proposalConfig.funds
        );
      }

      toast({
        title: "Success",
        isClosable: true,
        status: "success",
        description:
          "The Arena extension has sucessfully been proposed to the DAO.",
      });
    } catch (e: any) {
      toast({
        status: "error",
        title: "Error",
        description: e.toString(),
        isClosable: true,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Fade in={true}>
        <Stack>
          <FormControl isInvalid={!!errors.dao_address}>
            <FormLabel>DAO</FormLabel>
            <Input id="dao" {...register("dao_address")} />
            <FormErrorMessage>{errors.dao_address?.message}</FormErrorMessage>
          </FormControl>
          <EnableFormDAOCard
            cosmwasmClient={cosmwasmClient}
            control={control}
          />
          <SimpleGrid minChildWidth={"250px"}>
            <FormControl
              display="flex"
              alignItems="center"
              isInvalid={!!errors.only_members_execute}
            >
              <FormLabel htmlFor="only-members-execute">
                Only members execute
              </FormLabel>
              <Switch
                id="only-members-execute"
                {...register("only_members_execute")}
              />
              <FormErrorMessage>
                {errors.only_members_execute?.message}
              </FormErrorMessage>
            </FormControl>
            <FormControl
              display="flex"
              alignItems="center"
              isInvalid={!!errors.allow_revoting}
            >
              <FormLabel htmlFor="allow-revoting">Allow revoting</FormLabel>
              <Switch id="allow-revoting" {...register("allow_revoting")} />
              <FormErrorMessage>
                {errors.allow_revoting?.message}
              </FormErrorMessage>
            </FormControl>
            <FormControl
              display="flex"
              alignItems="center"
              isInvalid={!!errors.close_proposal_on_execution_failure}
            >
              <FormLabel htmlFor="close-on-failure">
                Close proposal on execution failure
              </FormLabel>
              <Switch
                id="close-on-failure"
                {...register("close_proposal_on_execution_failure")}
              />
              <FormErrorMessage>
                {errors.close_proposal_on_execution_failure?.message}
              </FormErrorMessage>
            </FormControl>
          </SimpleGrid>
          <FormControl isInvalid={!!errors.tax} maxW="150px">
            <FormLabel>Tax</FormLabel>
            <InputGroup>
              <Input
                type="number"
                {...register("tax", { valueAsNumber: true })}
                step="1"
                textAlign="right"
              />
              <InputRightElement>
                <BsPercent />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.tax?.message}</FormErrorMessage>
          </FormControl>
          <SimpleGrid minChildWidth="350px" my="2" gap={2}>
            <Grid
              templateColumns="repeat(5, 1fr)"
              gap={2}
              alignItems="flex-start"
            >
              <GridItem colSpan={3}>
                <FormControl isInvalid={!!errors.min_voting_duration?.duration}>
                  <FormLabel>Min Voting Duration</FormLabel>
                  <InputGroup>
                    <Input
                      type="number"
                      {...register("min_voting_duration.duration", {
                        setValueAs: (x) => (x === "" ? undefined : parseInt(x)),
                      })}
                      textAlign="right"
                    />
                    <InputRightAddon>
                      {watchMinVotingDurationUnits == "Time"
                        ? "seconds"
                        : "blocks"}
                    </InputRightAddon>
                  </InputGroup>
                  <FormErrorMessage>
                    {errors.min_voting_duration?.duration?.message}
                  </FormErrorMessage>
                </FormControl>
              </GridItem>
              <GridItem colSpan={2}>
                <FormControl
                  isInvalid={!!errors.min_voting_duration?.duration_units}
                >
                  <FormLabel>Units</FormLabel>
                  <Select {...register("min_voting_duration.duration_units")}>
                    <option value="Time">Time</option>
                    <option value="Height">Height</option>
                  </Select>
                  <FormErrorMessage>
                    {errors.min_voting_duration?.duration_units?.message}
                  </FormErrorMessage>
                </FormControl>
              </GridItem>
            </Grid>
            <Grid
              templateColumns="repeat(5, 1fr)"
              gap={2}
              alignItems="flex-start"
            >
              <GridItem colSpan={3}>
                <FormControl isInvalid={!!errors.max_voting_duration?.duration}>
                  <FormLabel>Max Voting Duration</FormLabel>
                  <InputGroup>
                    <Input
                      type="number"
                      {...register("max_voting_duration.duration", {
                        setValueAs: (x) => (x === "" ? undefined : parseInt(x)),
                      })}
                      textAlign="right"
                    />
                    <InputRightAddon>
                      {watchMaxVotingDurationUnits == "Time"
                        ? "seconds"
                        : "blocks"}
                    </InputRightAddon>
                  </InputGroup>
                  <FormErrorMessage>
                    {errors.max_voting_duration?.duration?.message}
                  </FormErrorMessage>
                </FormControl>
              </GridItem>
              <GridItem colSpan={2}>
                <FormControl
                  isInvalid={!!errors.max_voting_duration?.duration_units}
                >
                  <FormLabel>Units</FormLabel>
                  <Select {...register("max_voting_duration.duration_units")}>
                    <option value="Time">Time</option>
                    <option value="Height">Height</option>
                  </Select>
                  <FormErrorMessage>
                    {errors.max_voting_duration?.duration_units?.message}
                  </FormErrorMessage>
                </FormControl>
              </GridItem>
            </Grid>
          </SimpleGrid>
          <Grid
            templateColumns={useBreakpointValue({
              base: "1fr",
              sm: "repeat(2, 1fr)",
              xl: "repeat(4, 1fr)",
            })}
            gap={2}
            alignItems="flex-start"
          >
            <GridItem>
              <FormControl
                isInvalid={
                  !!errors.quorum?.percentage_threshold || !!errors.quorum
                }
              >
                <FormLabel>Quorum Threshold</FormLabel>
                <Select {...register("quorum.percentage_threshold")}>
                  <option value="Majority">Majority</option>
                  <option value="Percent">Percent</option>
                </Select>
                <FormErrorMessage>
                  {errors.quorum?.percentage_threshold?.message ??
                    errors.quorum?.message}
                </FormErrorMessage>
              </FormControl>
            </GridItem>
            {watchPercentageThreshold == "Percent" && (
              <GridItem>
                <FormControl isInvalid={!!errors.quorum?.percent}>
                  <FormLabel>Percentage</FormLabel>
                  <InputGroup>
                    <Input
                      type="number"
                      {...register("quorum.percent", {
                        setValueAs: (x) => (x === "" ? undefined : parseInt(x)),
                      })}
                      textAlign="right"
                      step="1"
                    />
                    <InputRightElement>
                      <BsPercent />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>
                    {errors.quorum?.percent?.message}
                  </FormErrorMessage>
                </FormControl>
              </GridItem>
            )}
          </Grid>
          <FormControl isInvalid={!!errors.rulesets}>
            <FormLabel>Rulesets</FormLabel>
            <FormProvider {...formMethods}>
              <Accordion defaultIndex={[0]} allowMultiple>
                {rulesetsFields.map((ruleset, rulesetIndex) => (
                  <AccordionItem key={ruleset.id}>
                    <HStack>
                      <AccordionButton>
                        <Box as="span" flex="1" textAlign="left">
                          Ruleset {rulesetIndex + 1}
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <Tooltip label="Delete Ruleset">
                        <IconButton
                          variant="ghost"
                          aria-label="Delete Ruleset"
                          icon={<DeleteIcon />}
                          onClick={() => rulesetsRemove(rulesetIndex)}
                        />
                      </Tooltip>
                    </HStack>
                    <AccordionPanel>
                      <FormControl
                        isInvalid={
                          !!errors.rulesets?.[rulesetIndex]?.description
                        }
                      >
                        <FormLabel>Description</FormLabel>
                        <Textarea
                          {...register(
                            `rulesets.${rulesetIndex}.description` as const
                          )}
                        />
                        <FormErrorMessage>
                          {
                            errors.rulesets?.[rulesetIndex]?.description
                              ?.message
                          }
                        </FormErrorMessage>
                      </FormControl>
                      <DAOEnableRulesetRules rulesetIndex={rulesetIndex} />
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </FormProvider>
            <Tooltip label="Add Ruleset">
              <IconButton
                mt="2"
                variant="ghost"
                aria-label="Add Ruleset"
                onClick={() =>
                  rulesetsAppend({
                    description: "",
                    is_enabled: true,
                    rules: [],
                  })
                }
                icon={<AddIcon />}
              />
            </Tooltip>
            <FormErrorMessage>{errors.rulesets?.message}</FormErrorMessage>
          </FormControl>
          <Button
            type="submit"
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
const EnableDAOPage = () => {
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
      <Heading>Enable the Arena Extension</Heading>
      <Text>
        This form is for adding a proposal module with the Arena Core extension
        for handling decentralized competitions.
      </Text>
      <Box w="100%">
        {cosmwasmClient && <EnableForm cosmwasmClient={cosmwasmClient} />}
      </Box>
    </Container>
  );
};

export default EnableDAOPage;
