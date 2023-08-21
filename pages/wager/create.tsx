import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from "@chakra-ui/form-control";
import {
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  ListItem,
  Spacer,
  Stack,
  UnorderedList,
} from "@chakra-ui/layout";
import {
  Alert,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Fade,
  IconButton,
  Input,
  InputGroup,
  InputRightAddon,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Select,
  Skeleton,
  Table,
  TableContainer,
  TableContainerProps,
  Tbody,
  Td,
  Textarea,
  Th,
  Thead,
  Tooltip,
  Tr,
  useBreakpointValue,
  useDisclosure,
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
  Control,
  Controller,
  UseFormClearErrors,
  UseFormGetValues,
  UseFormSetError,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { z } from "zod";
import {
  AddressSchema,
  AmountSchema,
  BalanceSchema,
  DueSchema,
  ExpirationSchema,
  convertToExpiration,
} from "~/helpers/SchemaHelpers";
import { fromBinary, toBinary } from "cosmwasm";
import { InstantiateMsg as DAOProposalMultipleInstantiateMsg } from "@dao/DaoProposalMultiple.types";
import { InstantiateMsg as DAOPreProposeMultipleInstantiateMsg } from "@dao/DaoPreProposeMultiple.types";
import { InstantiateMsg as DAOVotingCW4InstantiateMsg } from "@dao/DaoVotingCw4.types";
import { DAOCard } from "@components/cards/DAOCard";
import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import moment from "moment-timezone";
import { Ruleset } from "@arena/ArenaCore.types";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useDaoDaoCoreGetItemQuery } from "@dao/DaoDaoCore.react-query";
import { useArenaCoreQueryExtensionQuery } from "@arena/ArenaCore.react-query";
import env from "config/env";
import {
  DataLoadedResult,
  DueCard,
  ExponentInfo,
} from "@components/cards/DueCard";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { UserCard } from "@components/cards/UserCard";
import { debounce } from "lodash";
import { Cw20Card } from "@components/cards/Cw20Card";
import { NativeCard } from "@components/cards/NativeCard";
import { Cw721Card } from "@components/cards/Cw721Card";

const FormSchema = z.object({
  dao_address: AddressSchema,
  description: z.string().nonempty({ message: "Description is required" }),
  expiration: ExpirationSchema,
  name: z.string().nonempty({ message: "Name is required " }),
  rules: z.string().nonempty({ message: "Rule cannot be empty " }).array(),
  ruleset: z.number().optional(),
  dues: z.array(DueSchema).nonempty({ message: "Dues cannot be empty" }),
});
type FormValues = z.infer<typeof FormSchema>;

interface RulesetProps {
  addr: string;
  cosmwasmClient: CosmWasmClient;
  onRulesetSelect: (id: number | undefined) => void;
}

interface RulesetTableProps extends RulesetProps, TableContainerProps {
  onArenaCoreLoaded: (data: string | undefined) => void;
  setError: UseFormSetError<{ dao_address: string }>;
  clearErrors: UseFormClearErrors<{ dao_address: string }>;
}

interface RulesetTableInnerProps extends RulesetProps {
  start_after?: number;
  selectedRuleset: number | undefined;
  onRulesetLoaded: (data: number | undefined) => void;
}

const TokenTypes = z.enum(["cw20", "cw721", "native"]);

function RulesetTableInner({
  addr,
  cosmwasmClient,
  onRulesetSelect,
  onRulesetLoaded,
  selectedRuleset,
  start_after,
}: RulesetTableInnerProps) {
  const { data, isError } = useArenaCoreQueryExtensionQuery({
    client: new ArenaCoreQueryClient(cosmwasmClient, addr),
    args: { msg: { rulesets: { start_after } } },
  });
  const parseRulesets = useMemo(() => {
    if (!data) return [];
    let rulesets: [number, Ruleset][] = [];
    try {
      rulesets = fromBinary(data) as [number, Ruleset][];
    } catch {}

    return rulesets;
  }, [data]);
  useEffect(() => {
    if (data) {
      let rulesets = parseRulesets;
      let largestNumber = 0;

      if (rulesets.length > 0) {
        largestNumber = Math.max(...rulesets.map(([number]) => number));
      }

      onRulesetLoaded(largestNumber);
    } else onRulesetLoaded(undefined);
  }, [data, onRulesetLoaded, parseRulesets]);

  if (isError) return <></>;

  const rulesets = parseRulesets;
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
  const { data, isError, isLoading } = useDaoDaoCoreGetItemQuery({
    client: new DaoDaoCoreQueryClient(cosmwasmClient, addr),
    args: { key: env.ARENA_ITEM_KEY },
  });
  const [selectedRuleset, setSelectedRuleset] = useState<number | undefined>(
    undefined
  );
  const [lastRuleset, setLastRuleset] = useState<number | undefined>(undefined);

  useEffect(() => {
    onRulesetSelect(selectedRuleset);
    setSelectedRuleset(selectedRuleset);
  }, [selectedRuleset, onRulesetSelect]);

  useEffect(() => {
    if (isError || (data && !data.item))
      setError("dao_address", {
        message: "The dao does not have an arena core extension",
      });
    else clearErrors("dao_address");
  }, [isError, data, setError, clearErrors]);

  useEffect(() => {
    if (data && data.item) {
      onArenaCoreLoaded(data.item);
    } else {
      onArenaCoreLoaded(undefined);
    }
  }, [data, onArenaCoreLoaded]);

  if (isError) {
    return <></>;
  }

  if (lastRuleset == 0) return <></>;
  return (
    <Skeleton isLoaded={!isLoading}>
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
              {data && data.item && (
                <RulesetTableInner
                  addr={data.item}
                  cosmwasmClient={cosmwasmClient}
                  onRulesetSelect={setSelectedRuleset}
                  selectedRuleset={selectedRuleset}
                  onRulesetLoaded={setLastRuleset}
                />
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </FormControl>
    </Skeleton>
  );
}

interface DueFormProps extends ModalProps {
  bech32Prefix: string;
  cosmwasmClient: CosmWasmClient;
  isOpen: boolean;
  onClose: () => void;
  control: Control<FormValues>;
  index: number;
  getValues: UseFormGetValues<FormValues>;
}

const DueForm = ({
  bech32Prefix,
  isOpen,
  cosmwasmClient,
  onClose,
  index,
  control,
  getValues,
  ...modalProps
}: DueFormProps) => {
  const dueFormSchema = z
    .object({
      type: TokenTypes,
      key: z.string().nonempty({ message: "Key is required" }),
      amount: AmountSchema.optional(),
      token_id: z.string().optional(),
    })
    .superRefine((value, context) => {
      if (
        (value.type == "cw20" || value.type == "cw721") &&
        !AddressSchema.safeParse(value.key).success
      ) {
        context.addIssue({
          path: ["key"],
          code: z.ZodIssueCode.custom,
          message: "Address is not valid",
        });
      }
    })
    .superRefine((value, context) => {
      if ((value.type == "cw20" || value.type == "native") && !value.amount) {
        context.addIssue({
          path: ["amount"],
          code: z.ZodIssueCode.custom,
          message: "Amount is required for cw20 or native token",
        });
      }
    })
    .superRefine((value, context) => {
      if (value.type == "cw721" && !value.token_id) {
        context.addIssue({
          path: ["token_id"],
          code: z.ZodIssueCode.custom,
          message: "Token id is required for cw721's",
        });
      }
    });

  type DueFormValues = z.infer<typeof dueFormSchema>;
  const [key, setKey] = useState<string>(env.DEFAULT_NATIVE);
  const [tokenId, setTokenId] = useState<string | undefined>(undefined);
  const [dataLoadedResult, setDataLoadedResult] = useState<
    DataLoadedResult | undefined
  >(undefined);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<DueFormValues>({
    resolver: zodResolver(dueFormSchema),
    defaultValues: {
      type: "native",
      key: key,
    },
  });

  const { append: cw20Append } = useFieldArray({
    name: `dues.${index}.balance.cw20` as "dues.0.balance.cw20",
    control,
  });
  const { append: cw721Append } = useFieldArray({
    name: `dues.${index}.balance.cw721` as "dues.0.balance.cw721",
    control,
  });
  const { append: nativeAppend } = useFieldArray({
    name: `dues.${index}.balance.native` as "dues.0.balance.native",
    control,
  });

  const debouncedSetKey = debounce((value: string) => {
    setKey(value);
  }, 500);
  const debouncedSetTokenId = debounce((value: string) => {
    setTokenId(value);
  }, 500);
  const watchType = watch("type");
  const watchAmount = watch("amount");

  const onSubmit = async (values: DueFormValues) => {
    if (!dataLoadedResult) {
      setError("key", { message: "Could not retrieve data" });
      return;
    }

    switch (values.type) {
      case "cw20":
        if (
          getValues(`dues.${index}.balance.cw20`).find(
            (x) => x.address == values.key
          )
        ) {
          setError("key", { message: "Cannot add duplicates" });
          return;
        }
        cw20Append({
          address: values.key,
          amount: values.amount!,
        });
        break;
      case "cw721":
        if (
          getValues(`dues.${index}.balance.cw721`).find(
            (x) => x.addr == values.key
          )
        ) {
          setError("key", { message: "Cannot add duplicates" });
          return;
        }
        cw721Append({
          addr: values.key,
          token_ids: [values.token_id!],
        });
        break;
      case "native":
        if (
          getValues(`dues.${index}.balance.native`).find(
            (x) => x.denom == values.key
          )
        ) {
          setError("key", { message: "Cannot add duplicates" });
          return;
        }
        nativeAppend({ denom: values.key, amount: values.amount! });
        break;
      default:
        break;
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        clearErrors();
        onClose();
      }}
      {...modalProps}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Due Amount</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack>
            <FormControl isInvalid={!!errors.type}>
              <FormLabel>Type</FormLabel>
              <Select id="type" {...register("type")}>
                <option value="native">Native</option>
                <option value="cw20">Cw20 Token</option>
                <option value="cw721">Cw721 NFT</option>
              </Select>
              <FormErrorMessage>{errors.type?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.key}>
              <FormLabel>
                {watchType == "native" ? "Denom" : "Address"}
              </FormLabel>
              <Input
                id="key"
                {...register("key", {
                  onChange: (e) => {
                    e.persist();
                    debouncedSetKey(e.target.value);
                  },
                })}
              />
              <FormErrorMessage>{errors.key?.message}</FormErrorMessage>
            </FormControl>
            {watchType == "cw20" && AddressSchema.safeParse(key).success && (
              <Cw20Card
                cosmwasmClient={cosmwasmClient}
                address={key}
                amount={watchAmount ?? "0"}
                onDataLoaded={setDataLoadedResult}
              />
            )}
            {watchType == "native" && (
              <NativeCard
                denom={key}
                amount={watchAmount ?? "0"}
                onDataLoaded={setDataLoadedResult}
              />
            )}
            <FormControl
              isInvalid={!!errors.amount}
              hidden={watchType == "cw721"}
            >
              <FormLabel>Amount</FormLabel>
              <Input
                id="amount"
                type="number"
                {...register("amount", {
                  setValueAs: (x) => (x === "" ? undefined : x.toString()),
                })}
              />
              <FormErrorMessage>{errors.amount?.message}</FormErrorMessage>
            </FormControl>
            <FormControl
              isInvalid={!!errors.token_id}
              hidden={watchType != "cw721"}
            >
              <FormLabel>Token Id</FormLabel>
              <Input
                id="token_id"
                {...register("token_id", {
                  onChange: (e) => {
                    e.persist();
                    debouncedSetTokenId(e.target.value);
                  },
                })}
              />
              <FormErrorMessage>{errors.token_id?.message}</FormErrorMessage>
            </FormControl>
            {watchType == "cw721" &&
              AddressSchema.safeParse(key).success &&
              tokenId && (
                <Cw721Card
                  address={key}
                  cosmwasmClient={cosmwasmClient}
                  token_ids={[tokenId]}
                  onDataLoaded={setDataLoadedResult}
                />
              )}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          >
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

interface WagerFormProps {
  cosmwasmClient: CosmWasmClient;
}

function WagerForm({ cosmwasmClient }: WagerFormProps) {
  const router = useRouter();
  const toast = useToast();
  const { chain, getSigningCosmWasmClient, address, isWalletConnected } =
    useChain(env.CHAIN);

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    setValue,
    getValues,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
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
  useEffect(() => {
    if (router.query.dao as string | undefined)
      setValue("dao_address", router.query.dao as string);
  }, [router.query.dao, setValue]);

  const watchExpirationUnits = watch("expiration.expiration_units");

  const watchDaoAddress = watch("dao_address");
  const [arenaCoreAddr, setArenaCoreAddr] = useState<string | undefined>();

  const onRulesetSelect = (id: number | undefined) => {
    setValue("ruleset", id);
  };

  const {
    fields: duesField,
    append: duesAppend,
    remove: duesRemove,
  } = useFieldArray({
    name: "dues",
    control,
  });
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [exponentInfo, setExponentInfo] = useState<ExponentInfo | undefined>(
    undefined
  );
  const [dueFormTarget, setDueFormTarget] = useState<number>(0);

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

      // We need to have a dictionary of address/denom to decimal points

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
                    /*module_may_propose: { // Do not enable for now, because the wager module needs access
                      info: {
                        code_id: parseInt(
                          process.env
                            .NEXT_PUBLIC_CODE_ID_DAO_PREPROPOSE_MULTIPLE!
                        ),
                        admin: { address: { addr: values.dao_address } },
                        label: "DAO PrePropose Multiple",
                        msg: toBinary({
                          extension: {},
                          open_proposal_submission: false,
                        } as DAOPreProposeMultipleInstantiateMsg),
                      },
                    },*/
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

      await wagerModuleClient.createCompetition(msg);

      toast({
        title: "Success",
        isClosable: true,
        status: "success",
        description: "The competition has sucessfully been created.",
      });
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
          {AddressSchema.safeParse(watchDaoAddress).success && (
            <DAOCard
              address={watchDaoAddress}
              cosmwasmClient={cosmwasmClient}
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
          {AddressSchema.safeParse(watchDaoAddress).success && (
            <RulesetTable
              cosmwasmClient={cosmwasmClient}
              addr={watchDaoAddress}
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
                <Stack>
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
              {duesField.map(
                (_due: z.infer<typeof DueSchema>, dueIndex: number) => {
                  return (
                    <Card key={dueIndex} variant="outline">
                      <CardHeader pb="0">
                        <Flex>
                          <Heading size="md">Team {dueIndex + 1}</Heading>
                          <Spacer />
                          <Tooltip label="Delete Team">
                            <IconButton
                              aria-label="delete"
                              variant="ghost"
                              icon={<DeleteIcon />}
                              onClick={() => duesRemove(dueIndex)}
                            />
                          </Tooltip>
                        </Flex>
                      </CardHeader>
                      <CardBody>
                        <FormControl
                          isInvalid={!!errors.dues?.[dueIndex]?.addr}
                        >
                          <FormLabel>Address</FormLabel>
                          <Input
                            {...register(`dues.${dueIndex}.addr` as const)}
                          />
                          <FormErrorMessage>
                            {errors.dues?.[dueIndex]?.addr?.message}
                          </FormErrorMessage>
                        </FormControl>
                        <FormControl
                          isInvalid={!!errors.dues?.[dueIndex]?.balance}
                        >
                          <FormLabel mb="0">Balance</FormLabel>
                          <Controller
                            key={dueIndex}
                            control={control}
                            name={`dues.${dueIndex}.balance`}
                            render={({ field: { onChange, value } }) => (
                              <DueCard
                                variant="ghost"
                                borderWidth={0}
                                cosmwasmClient={cosmwasmClient}
                                balance={value}
                                onDataLoaded={setExponentInfo}
                                nativeDeleteFn={(index: number) => {
                                  if (exponentInfo) {
                                    let map = new Map(exponentInfo.native);
                                    map.delete(value.native[index]!.denom);
                                    setExponentInfo({
                                      ...exponentInfo,
                                      native: map,
                                    });
                                  }
                                  onChange({
                                    ...value,
                                    native: [
                                      ...value.native.slice(0, index),
                                      ...value.native.slice(index + 1),
                                    ],
                                  });
                                  trigger(`dues.${dueIndex}.balance.native`);
                                }}
                                cw20DeleteFn={(index: number) => {
                                  if (exponentInfo) {
                                    let map = new Map(exponentInfo.cw20);
                                    map.delete(value.cw20[index]!.address);
                                    setExponentInfo({
                                      ...exponentInfo,
                                      cw20: map,
                                    });
                                  }
                                  onChange({
                                    ...value,
                                    cw20: [
                                      ...value.cw20.slice(0, index),
                                      ...value.cw20.slice(index + 1),
                                    ],
                                  });
                                }}
                              />
                            )}
                          />
                          <FormErrorMessage>
                            {errors.dues?.[dueIndex]?.balance?.message}
                          </FormErrorMessage>
                        </FormControl>
                      </CardBody>
                      <CardFooter>
                        <Tooltip label="Add Amount">
                          <IconButton
                            aria-label="add"
                            variant="ghost"
                            icon={<AddIcon />}
                            onClick={() => {
                              setDueFormTarget(dueIndex);
                              onOpen();
                            }}
                          />
                        </Tooltip>
                      </CardFooter>
                    </Card>
                  );
                }
              )}
              <DueForm
                bech32Prefix={chain.bech32_prefix}
                isOpen={isOpen}
                onClose={onClose}
                cosmwasmClient={cosmwasmClient}
                index={dueFormTarget}
                getValues={getValues}
                control={control}
              >
                <></>
              </DueForm>
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
