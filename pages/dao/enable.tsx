import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormHelperText,
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
  useBreakpointValue,
} from "@chakra-ui/react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Ruleset,
  InstantiateMsg as ArenaCoreInstantiateMsg,
} from "~/ts-codegen/arena/ArenaCore.types";
import { BsPercent, BsPlus } from "react-icons/bs";
import { FiDelete } from "react-icons/fi";
import { useChain } from "@cosmos-kit/react-lite";
import { Config, ExecuteMsg as DaoCoreExecuteMsg } from "@dao/DaoCore.types";
import { DaoProposalSingleClient } from "@dao/DaoProposalSingle.client";
import { InstantiateMsg as ArenaWagerModuleInstantiateMsg } from "@arena/ArenaWagerModule.types";
import { InstantiateMsg as DAOProposalMultipleInstantiateMsg } from "@dao/DaoProposalMultiple.types";
import { toBinary } from "cosmwasm";
import { getProposalAddr } from "~/helpers/DAOHelpers";
import { DaoPreProposeSingleClient } from "@dao/DaoPreProposeSingle.client";
import {
  DAOAddressSchema,
  DurationSchema,
  PercentageThresholdSchema,
  convertToDuration,
} from "~/helpers/SchemaHelpers";
import { useEffect, useState } from "react";
import { DaoCoreQueryClient } from "@dao/DaoCore.client";
import { DAOCard } from "@components/DAOCard";

const EnableForm = () => {
  const chainContext = useChain(process.env.NEXT_PUBLIC_CHAIN!);
  let daoAddressSchema = DAOAddressSchema(chainContext.chain.bech32_prefix);

  const validationSchema = z
    .object({
      dao: daoAddressSchema,
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
            rules: z
              .array(z.string().nonempty("Rule cannot be empty"))
              .refine((rules) => rules.length > 0, {
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
      dao: "",
      rulesets: [] as Ruleset[],
      tax: 15,
      allow_revoting: false,
      close_proposal_on_execution_failure: true,
      max_voting_duration: { duration: 1209600, duration_units: "Time" }, //2 weeks in seconds
      min_voting_duration: { duration_units: "Time" },
      only_members_execute: false,
      quorum: { percentage_threshold: "Majority" },
    },
    resolver: zodResolver(validationSchema),
  });
  const watchMinVotingDurationUnits = watch(
    "min_voting_duration.duration_units"
  );
  const watchMaxVotingDurationUnits = watch(
    "max_voting_duration.duration_units"
  );
  const watchPercentageThreshold = watch("quorum.percentage_threshold");

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

  const {
    fields: rulesetsFields,
    append: rulesetsAppend,
    remove: rulesetsRemove,
  } = useFieldArray({
    name: "rulesets",
    control,
  });

  const onSubmit = async (values: FormValues) => {
    let cosmWasmClient = await chainContext.getSigningCosmWasmClient();

    if (!cosmWasmClient) {
      console.error("Could not get the CosmWasm client.");
      return;
    }

    try {
      const proposalAddrResponse = await getProposalAddr(
        cosmWasmClient,
        values.dao,
        chainContext.address!
      );

      if (!proposalAddrResponse) {
        setError("dao", {
          message:
            "The dao does not have an accessible single proposal module available.",
        });
        return;
      }

      let arena_wager_module_instantiate = {
        code_id: parseInt(process.env.NEXT_PUBLIC_CODE_ID_WAGER_MODULE!),
        label: "Arena Wager Module",
        msg: toBinary({
          key: process.env.NEXT_PUBLIC_WAGER_MODULE_KEY!,
          description: "The Arena Protocol Wager Module",
          extension: {},
        } as ArenaWagerModuleInstantiateMsg),
        admin: { core_module: {} },
      };

      let arena_core_instantiate = {
        code_id: parseInt(process.env.NEXT_PUBLIC_CODE_ID_ARENA_CORE!),
        label: "Arena Core",
        msg: toBinary({
          open_proposal_submission: false,
          extension: {
            tax: (values.tax / 100).toString(),
            rulesets: values.rulesets,
            competition_modules_instantiate_info: [
              arena_wager_module_instantiate,
            ],
          },
        } as ArenaCoreInstantiateMsg),
        admin: { core_module: {} },
      };

      let dao_proposal_multiple_instantiate = {
        code_id: parseInt(
          process.env.NEXT_PUBLIC_CODE_ID_DAO_PROPOSAL_MULTIPLE!
        ),
        label: "Arena Proposal Multiple Module",
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
          voting_strategy: {
            single_choice: {
              quorum:
                values.quorum.percentage_threshold == "Majority"
                  ? { majority: {} }
                  : { percent: values.quorum.percent },
            },
          },
        } as DAOProposalMultipleInstantiateMsg),
        admin: { core_module: {} },
      };

      const executeMsg: DaoCoreExecuteMsg = {
        update_proposal_modules: {
          to_add: [dao_proposal_multiple_instantiate],
          to_disable: [],
        },
      };

      let cosmosMsg = {
        wasm: {
          execute: {
            contract_addr: values.dao,
            msg: toBinary(executeMsg),
            funds: [],
          },
        },
      };

      let proposal_description =
        "Enabling the Arena Protocol extension provides a framework for organizing and managing decentralized competitions, allowing for fair and transparent competition validation. By enabling the extension, participants can compete against each other in a trustless environment, and the DAO can ensure that the competition is fair and secure.";
      let proposal_title = "Enable the Arena Protocol extension.";
      if (proposalAddrResponse.type == "proposal_module") {
        let daoProposalClient = new DaoProposalSingleClient(
          cosmWasmClient,
          chainContext.address!,
          proposalAddrResponse.addr
        );

        await daoProposalClient.propose({
          title: proposal_title,
          description: proposal_description,
          msgs: [cosmosMsg],
        });
      } else if (proposalAddrResponse.type == "prepropose") {
        let preProposeClient = new DaoPreProposeSingleClient(
          cosmWasmClient,
          chainContext.address!,
          proposalAddrResponse.addr
        );

        await preProposeClient.propose({
          msg: {
            propose: {
              title: proposal_title,
              description: proposal_description,
              msgs: [cosmosMsg],
            },
          },
        });
      }
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
      <SimpleGrid minChildWidth={"200px"} my="2">
        <FormControl
          display="flex"
          alignItems="center"
          isInvalid={!!errors.only_members_execute}
        >
          <FormLabel htmlFor="only-members-execute" mb="0">
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
          <FormLabel htmlFor="allow-revoting" mb="0">
            Allow revoting
          </FormLabel>
          <Switch id="allow-revoting" {...register("allow_revoting")} />
          <FormErrorMessage>{errors.allow_revoting?.message}</FormErrorMessage>
        </FormControl>
        <FormControl
          display="flex"
          alignItems="center"
          isInvalid={!!errors.close_proposal_on_execution_failure}
        >
          <FormLabel htmlFor="close-on-failure" mb="0">
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
      <SimpleGrid minChildWidth="300px" my="2" gap={2}>
        <Grid templateColumns="repeat(5, 1fr)" gap={1} alignItems="flex-start">
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
                  {watchMinVotingDurationUnits == "Time" ? "seconds" : "blocks"}
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
        <Grid templateColumns="repeat(5, 1fr)" gap={1} alignItems="flex-start">
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
                  {watchMaxVotingDurationUnits == "Time" ? "seconds" : "blocks"}
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
        gap={1}
        alignItems="flex-start"
      >
        <GridItem>
          <FormControl
            isInvalid={!!errors.quorum?.percentage_threshold || !!errors.quorum}
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
        <Accordion allowToggle>
          {rulesetsFields.map((ruleset, rulesetIndex) => (
            <AccordionItem key={ruleset.id}>
              <HStack>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    Ruleset {rulesetIndex + 1}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <IconButton
                  variant="outline"
                  colorScheme="secondary"
                  aria-label="Delete Ruleset"
                  icon={<FiDelete />}
                  onClick={(e) => {
                    e.stopPropagation();
                    rulesetsRemove(rulesetIndex);
                  }}
                />
              </HStack>
              <AccordionPanel pb={4}>
                <FormControl
                  isInvalid={!!errors.rulesets?.[rulesetIndex]?.description}
                >
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    {...register(
                      `rulesets.${rulesetIndex}.description` as const
                    )}
                  />
                  <FormErrorMessage>
                    {errors.rulesets?.[rulesetIndex]?.description?.message}
                  </FormErrorMessage>
                </FormControl>
                <FormLabel>Rules</FormLabel>
                <Controller
                  control={control}
                  name={`rulesets.${rulesetIndex}.rules`}
                  defaultValue={[] as string[]}
                  render={({ field: { onChange, onBlur, value, ref } }) => (
                    <Stack spacing={4}>
                      {value?.map((_rule, ruleIndex) => (
                        <FormControl
                          key={ruleIndex}
                          isInvalid={
                            !!errors.rulesets?.[rulesetIndex]?.rules?.[
                              ruleIndex
                            ]
                          }
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
                            {
                              errors.rulesets?.[rulesetIndex]?.rules?.[
                                ruleIndex
                              ]?.message
                            }
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
                <FormErrorMessage>
                  {errors.rulesets?.[rulesetIndex]?.rules?.message}
                </FormErrorMessage>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
        <IconButton
          mt={4}
          variant="outline"
          colorScheme="secondary"
          aria-label="Add Ruleset"
          onClick={() =>
            rulesetsAppend({ description: "", is_enabled: true, rules: [] })
          }
          icon={<BsPlus />}
        />
        <FormErrorMessage>{errors.rulesets?.message}</FormErrorMessage>
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
const EnableDAOPage = () => {
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
        Enable the Arena Extension
      </Heading>
      <Stack w="100%" spacing={4}>
        <EnableForm />
      </Stack>
    </Container>
  );
};

export default EnableDAOPage;
