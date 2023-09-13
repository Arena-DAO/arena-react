import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from "@chakra-ui/form-control";
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Stack,
} from "@chakra-ui/layout";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
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
import { InstantiateMsg as DaoDaoCoreInstantiateMsg } from "@dao/DaoDaoCore.types";
import { InstantiateMsg as ArenaEscrowInstantiateMsg } from "@arena/ArenaEscrow.types";
import { ArenaCoreQueryClient } from "@arena/ArenaCore.client";
import { ArenaWagerModuleClient } from "@arena/ArenaWagerModule.client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import {
  AddressSchema,
  DueSchema,
  ExpirationSchema,
  RulesSchema,
  convertToExpiration,
  convertToRules,
} from "~/helpers/SchemaHelpers";
import { InstantiateMsg as DAOProposalMultipleInstantiateMsg } from "@dao/DaoProposalMultiple.types";
import { InstantiateMsg as DAOVotingCW4InstantiateMsg } from "@dao/DaoVotingCw4.types";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import moment from "moment-timezone";
import { CosmWasmClient, toBinary } from "@cosmjs/cosmwasm-stargate";
import env from "config/env";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { WagerCreateRulesetTable } from "@components/pages/wager/create/RulesetTable";
import { WagerCreateDAOCard } from "@components/pages/wager/create/DAOCard";
import { WagerCreateTeamCard } from "@components/pages/wager/create/TeamCard";
import { CompetitionModuleResponse } from "@arena/ArenaCore.types";

const FormSchema = z.object({
  dao_address: AddressSchema,
  description: z.string().nonempty({ message: "Description is required" }),
  expiration: ExpirationSchema,
  name: z.string().nonempty({ message: "Name is required " }),
  rules: RulesSchema,
  ruleset: z.string().optional(),
  dues: z.array(DueSchema).nonempty({ message: "Dues cannot be empty" }),
  proposal_title: z
    .string()
    .nonempty({ message: "Proposal title cannot be empty" }),
  proposal_description: z
    .string()
    .nonempty({ message: "Proposal description cannot be empty" }),
  competition_dao_name: z
    .string()
    .nonempty({ message: "Competition DAO name cannot be empty" }),
  competition_dao_description: z
    .string()
    .nonempty({ message: "Competition DAO description cannot be empty" }),
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
      competition_dao_name: "Arena Competition DAO",
      competition_dao_description: "A DAO for handling an Arena Competition",
      proposal_title: "Competition Result",
      proposal_description:
        "This proposal allows members to vote on the winner of the competition. Each choice represents a different team. Select the team that you believe should win the competition.",
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

  const onRulesetSelect = (id: string | undefined) => {
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

  const {
    fields: rulesFields,
    append: rulesAppend,
    remove: rulesRemove,
  } = useFieldArray({ name: "rules", control });

  const onSubmit = async (values: FormValues) => {
    try {
      let cosmwasmClient = await getSigningCosmWasmClient();
      if (!cosmwasmClient) throw "Could not get the CosmWasm client";
      if (!address) throw "Could not get user address";
      if (!arenaCoreAddr) {
        throw "The DAO does not have an Arena extension.";
      }

      let arenaCoreClient = new ArenaCoreQueryClient(
        cosmwasmClient,
        arenaCoreAddr
      );

      let wager_module = (await arenaCoreClient.queryExtension({
        msg: {
          competition_module: {
            key: env.WAGER_MODULE_KEY,
          },
        },
      })) as unknown as CompetitionModuleResponse;

      if (!wager_module)
        throw "The DAO's Arena extension does not have a wager module set.";

      let wagerModuleClient = new ArenaWagerModuleClient(
        cosmwasmClient,
        address,
        wager_module.addr
      );

      const msg = {
        description: values.description,
        expiration: convertToExpiration(values.expiration),
        name: values.name,
        rules: convertToRules(values.rules),
        ruleset: values.ruleset,
        extension: {},
        competitionDao: {
          code_id: env.CODE_ID_DAO_CORE,
          admin: { address: { addr: values.dao_address } },
          label: "Arena Competition DAO",
          msg: toBinary({
            admin: values.dao_address,
            automatically_add_cw20s: true,
            automatically_add_cw721s: true,
            description: values.competition_dao_description,
            name: values.competition_dao_name,
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
          admin: { address: { addr: values.dao_address } },
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

      try {
        if (id) {
          await wagerModuleClient.generateProposals({
            id,
            proposalDetails: {
              title: values.proposal_title,
              description: values.proposal_description,
            },
          });

          toast({
            title: "Success",
            isClosable: true,
            status: "success",
            description: "The competition's proposals have been generated.",
          });
        }
      } catch (e) {
        throw e;
      } finally {
        router.push(`/wager/view?dao=${values.dao_address}&id=${id}`);
      }
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
    <form onSubmit={handleSubmit(onSubmit)}>
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
            <Stack>
              {rulesFields?.map((rule, ruleIndex) => (
                <FormControl
                  key={rule.id}
                  isInvalid={!!errors.rules?.[ruleIndex]?.rule}
                >
                  <InputGroup>
                    <Input {...register(`rules.${ruleIndex}.rule`)} />
                    <InputRightElement>
                      <Tooltip label="Delete Rule">
                        <IconButton
                          aria-label="delete"
                          variant="ghost"
                          icon={<DeleteIcon />}
                          onClick={() => rulesRemove(ruleIndex)}
                        />
                      </Tooltip>
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>
                    {errors.rules?.[ruleIndex]?.rule?.message}
                  </FormErrorMessage>
                </FormControl>
              ))}
              <Tooltip label="Add Rule">
                <IconButton
                  variant="ghost"
                  colorScheme="secondary"
                  aria-label="Add Rule"
                  alignSelf="flex-start"
                  onClick={() => rulesAppend({ rule: "" })}
                  icon={<AddIcon />}
                />
              </Tooltip>
            </Stack>
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
          <Accordion allowToggle allowMultiple>
            <AccordionItem>
              <AccordionButton>
                <Box as="span" flex="1" textAlign="left">
                  Competition DAO Details <small>(optional)</small>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <Stack>
                  <FormControl isInvalid={!!errors.competition_dao_name}>
                    <FormLabel>Name</FormLabel>
                    <InputGroup>
                      <Input {...register("competition_dao_name")} />
                    </InputGroup>
                    <FormErrorMessage>
                      {errors.competition_dao_name?.message}
                    </FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!errors.competition_dao_description}>
                    <FormLabel>Description</FormLabel>
                    <InputGroup>
                      <Textarea {...register("competition_dao_description")} />
                    </InputGroup>
                    <FormErrorMessage>
                      {errors.competition_dao_description?.message}
                    </FormErrorMessage>
                  </FormControl>
                </Stack>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <AccordionButton>
                <Box as="span" flex="1" textAlign="left">
                  Proposal Details <small>(optional)</small>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <Stack>
                  <FormControl isInvalid={!!errors.proposal_title}>
                    <FormLabel>Title</FormLabel>
                    <InputGroup>
                      <Input {...register("proposal_title")} />
                    </InputGroup>
                    <FormErrorMessage>
                      {errors.proposal_title?.message}
                    </FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!errors.proposal_description}>
                    <FormLabel>Description</FormLabel>
                    <InputGroup>
                      <Textarea {...register("proposal_description")} />
                    </InputGroup>
                    <FormErrorMessage>
                      {errors.proposal_description?.message}
                    </FormErrorMessage>
                  </FormControl>
                </Stack>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
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
      <Box w="100%">
        {cosmwasmClient && <WagerForm cosmwasmClient={cosmwasmClient} />}
      </Box>
    </Container>
  );
};

export default CreateWagerPage;
