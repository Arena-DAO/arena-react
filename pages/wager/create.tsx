import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from "@chakra-ui/form-control";
import {
  Container,
  Grid,
  GridItem,
  Heading,
  ListItem,
  Stack,
  UnorderedList,
} from "@chakra-ui/layout";
import {
  Button,
  ButtonGroup,
  IconButton,
  Input,
  InputGroup,
  InputRightAddon,
  InputRightElement,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Select,
  Table,
  TableContainer,
  TableContainerProps,
  Tbody,
  Td,
  Textarea,
  Th,
  Thead,
  Tr,
  useBreakpointValue,
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
  UseFormClearErrors,
  UseFormSetError,
  useForm,
} from "react-hook-form";
import { z } from "zod";
import {
  DAOAddressSchema,
  DueSchema,
  ExpirationSchema,
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
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useDaoDaoCoreGetItemQuery } from "@dao/DaoDaoCore.react-query";
import { useArenaCoreQueryExtensionQuery } from "@arena/ArenaCore.react-query";

interface RulesetProps {
  addr: string;
  cosmwasmClient: CosmWasmClient;
  onRulesetSelect: (id: number | undefined) => void;
}

interface RulesetTableProps extends RulesetProps, TableContainerProps {
  onArenaCoreLoaded: (data: string | undefined) => void;
  setError: UseFormSetError<{ dao: string }>;
  clearErrors: UseFormClearErrors<{ dao: string }>;
}

interface RulesetTableInnerProps extends RulesetProps {
  start_after?: number;
  selectedRuleset: number | undefined;
  onRulesetLoaded: (data: number | undefined) => void;
}

function RulesetTableInner({
  addr,
  cosmwasmClient,
  onRulesetSelect,
  onRulesetLoaded,
  selectedRuleset,
  start_after,
}: RulesetTableInnerProps) {
  const { data, isLoading, isError } = useArenaCoreQueryExtensionQuery({
    client: new ArenaCoreQueryClient(cosmwasmClient, addr),
    args: { msg: { rulesets: { start_after } } },
  });
  const parseRulesets = (data: string) => {
    let rulesets: [number, Ruleset][] = [];
    try {
      rulesets = fromBinary(data) as [number, Ruleset][];
    } catch {}

    return rulesets;
  };
  useEffect(() => {
    if (data && !isError && !isLoading) {
      let rulesets = parseRulesets(data);
      let largestNumber = 0;

      if (rulesets.length > 0) {
        largestNumber = Math.max(...rulesets.map(([number]) => number));
      }

      onRulesetLoaded(largestNumber);
    } else onRulesetLoaded(undefined);
  }, [isError, data, isLoading, onRulesetLoaded]);

  if (isLoading || isError || !data) return <></>;

  const rulesets = parseRulesets(data);
  return (
    <>
      {rulesets.map((ruleset) => (
        <Tr key={ruleset[0]}>
          <Td>{ruleset[1].description}</Td>
          <Td>
            <ButtonGroup>
              <Popover>
                <PopoverTrigger>
                  <Button>View</Button>
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverHeader>Rules</PopoverHeader>
                  <PopoverBody>
                    <UnorderedList>
                      {ruleset[1].rules.map((rule, index) => (
                        <ListItem key={index}>{rule}</ListItem>
                      ))}
                    </UnorderedList>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
              {selectedRuleset != ruleset[0] && (
                <Button onClick={() => onRulesetSelect(ruleset[0])}>
                  Select
                </Button>
              )}
              {selectedRuleset == ruleset[0] && (
                <Button onClick={() => onRulesetSelect(undefined)}>
                  Unselect
                </Button>
              )}
            </ButtonGroup>
          </Td>
        </Tr>
      ))}
    </>
  );
}

function RulesetTable({
  addr,
  cosmwasmClient,
  onRulesetSelect,
  setError,
  onArenaCoreLoaded,
  clearErrors,
  ...props
}: RulesetTableProps) {
  const { data, isLoading, isError } = useDaoDaoCoreGetItemQuery({
    client: new DaoDaoCoreQueryClient(cosmwasmClient, addr),
    args: { key: process.env.NEXT_PUBLIC_ITEM_KEY! },
  });
  const [selectedRuleset, setSelectedRuleset] = useState<number | undefined>(
    undefined
  );
  const [lastRuleset, setLastRuleset] = useState<number | undefined>(undefined);

  useEffect(() => {
    onRulesetSelect(selectedRuleset);
    setSelectedRuleset(selectedRuleset);
  }, [selectedRuleset]);

  useEffect(() => {
    if (isError || !data || !data.item)
      setError("dao", {
        message: "The dao does not have an arena core extension",
      });
    else clearErrors("dao");
  }, [isError, data]);

  useEffect(() => {
    if (data && data.item && !isError && !isLoading) {
      onArenaCoreLoaded(data.item);
    } else {
      onArenaCoreLoaded(undefined);
    }
  }, [data, isError, isLoading, onArenaCoreLoaded]);

  if (!data || !data.item || isError || isLoading) {
    return <></>;
  }

  if (lastRuleset == 0) return <></>;
  return (
    <FormControl>
      <FormLabel>Rulesets</FormLabel>
      <TableContainer {...props}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Description</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {
              <RulesetTableInner
                addr={data.item}
                cosmwasmClient={cosmwasmClient}
                onRulesetSelect={setSelectedRuleset}
                selectedRuleset={selectedRuleset}
                onRulesetLoaded={setLastRuleset}
              />
            }
          </Tbody>
        </Table>
      </TableContainer>
    </FormControl>
  );
}

const WagerForm = () => {
  const router = useRouter();
  const {
    getCosmWasmClient,
    chain,
    getSigningCosmWasmClient,
    address,
    isWalletConnected,
  } = useChain(process.env.NEXT_PUBLIC_CHAIN!);
  const [cosmwasmClient, setCosmwasmClient] = useState<
    CosmWasmClient | undefined
  >(undefined);

  useEffect(() => {
    async function fetchClient() {
      const client = await getCosmWasmClient();
      setCosmwasmClient(client);
    }

    fetchClient();
  }, [getCosmWasmClient]);
  const daoAddressSchema = DAOAddressSchema(chain.bech32_prefix);

  const validationSchema = z.object({
    dao: daoAddressSchema,
    description: z.string().nonempty({ message: "Description is required" }),
    expiration: ExpirationSchema,
    name: z.string().nonempty({ message: "Name is required " }),
    rules: z.string().nonempty({ message: "Rule cannot be empty " }).array(),
    ruleset: z.number().optional(),
    dues: z.array(DueSchema),
  });

  type FormValues = z.infer<typeof validationSchema>;

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
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

  useEffect(() => {
    if (router.query.dao as string | undefined)
      setValue("dao", router.query.dao as string);
  }, [router.query.dao, setValue]);

  const watchExpirationUnits = watch("expiration.expiration_units");

  const watchDao = watch("dao");
  const [arenaCoreAddr, setArenaCoreAddr] = useState<string | undefined>();

  const onRulesetSelect = (id: number | undefined) => {
    setValue("ruleset", id);
  };

  const onSubmit = async (values: FormValues) => {
    let cosmWasmClient = await getSigningCosmWasmClient();

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
        address!,
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
          } as DaoDaoCoreInstantiateMsg),
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
      {!!cosmwasmClient && daoAddressSchema.safeParse(watchDao).success && (
        <DAOCard
          addr={watchDao}
          setError={setError}
          clearErrors={clearErrors}
          cosmwasmClient={cosmwasmClient}
          my="2"
        />
      )}
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
      {!!cosmwasmClient && daoAddressSchema.safeParse(watchDao).success && (
        <RulesetTable
          cosmwasmClient={cosmwasmClient}
          addr={watchDao}
          onRulesetSelect={onRulesetSelect}
          setError={setError}
          clearErrors={clearErrors}
          onArenaCoreLoaded={setArenaCoreAddr}
        />
      )}
      <FormControl isInvalid={!!errors.rules}>
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
        isDisabled={!isWalletConnected}
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
