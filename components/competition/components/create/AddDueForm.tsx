import {
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/form-control";
import { Stack } from "@chakra-ui/layout";
import {
  ModalProps,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Select,
  Input,
  ModalFooter,
  Button,
} from "@chakra-ui/react";
import { Cw20Card } from "@components/cards/Cw20Card";
import { Cw721Card } from "@components/cards/Cw721Card";
import { NativeCard } from "@components/cards/NativeCard";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { zodResolver } from "@hookform/resolvers/zod";
import { debounce } from "lodash";
import env from "@config/env";
import { useEffect, useMemo, useState } from "react";
import {
  UseFormGetValues,
  useForm,
  UseFieldArrayAppend,
} from "react-hook-form";
import { z } from "zod";
import {
  getCoinAsset,
  getBaseCoin,
  getCw20Asset,
} from "~/helpers/TokenHelpers";
import { useChain } from "@cosmos-kit/react";
import { Asset } from "@chain-registry/types";
import { Cw721BaseQueryClient } from "@cw-nfts/Cw721Base.client";
import { isValidContractAddress } from "~/helpers/AddressHelpers";
import { AmountSchema, AddressSchema } from "@config/schemas";
import { CreateCompetitionFormValues } from "@components/competition/CreateCompetitionForm";

interface AddDueFormProps extends ModalProps {
  cosmwasmClient: CosmWasmClient;
  isOpen: boolean;
  onClose: () => void;
  index: number;
  getValues: UseFormGetValues<CreateCompetitionFormValues>;
  cw20Append: UseFieldArrayAppend<
    CreateCompetitionFormValues,
    `dues.0.balance.cw20`
  >;
  nativeAppend: UseFieldArrayAppend<
    CreateCompetitionFormValues,
    `dues.0.balance.native`
  >;
  cw721Append: UseFieldArrayAppend<
    CreateCompetitionFormValues,
    `dues.0.balance.cw721`
  >;
}

export const TokenTypes = z.enum(["cw20", "cw721", "native"]);

export const AddDueForm = ({
  isOpen,
  cosmwasmClient,
  onClose,
  index,
  cw20Append,
  nativeAppend,
  cw721Append,
  getValues,
  ...modalProps
}: AddDueFormProps) => {
  const { assets } = useChain(env.CHAIN);
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

  const {
    register,
    handleSubmit,
    watch,
    setError,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<DueFormValues>({
    resolver: zodResolver(dueFormSchema),
    defaultValues: {
      type: "native",
      key: env.DEFAULT_NATIVE,
    },
  });

  const [key, setKey] = useState<string>();
  const [tokenId, setTokenId] = useState<string>();

  const debouncedSetKey = useMemo(
    () =>
      debounce((value: string) => {
        setKey(value);
      }, 1000),
    [setKey]
  );
  const debouncedSetTokenId = useMemo(
    () =>
      debounce((value: string | undefined) => {
        setTokenId(value);
      }, 1000),
    [setTokenId]
  );
  const watchType = watch("type");
  const watchAmount = watch("amount");
  const watchKey = watch("key");
  const watchTokenId = watch("token_id");

  useEffect(() => {
    debouncedSetKey(watchKey);
  }, [watchKey, debouncedSetKey]);
  useEffect(() => {
    debouncedSetTokenId(watchTokenId);
  }, [watchTokenId, debouncedSetTokenId]);

  const onSubmit = async (values: DueFormValues) => {
    if (!assets) {
      setError("key", { message: "Cannot retrieve assets" });
      return;
    }
    let asset: Asset | undefined;

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

        asset = await getCw20Asset(values.key, cosmwasmClient, assets.assets);
        if (!asset) {
          setError("key", { message: "Cannot find cw20 asset" });
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
            (x) => x.address == values.key
          )
        ) {
          setError("key", { message: "Cannot add duplicates" });
          return;
        }
        if (!values.token_id) {
          setError("token_id", { message: "Token id is required" });
          return;
        }

        const cw721Client = new Cw721BaseQueryClient(
          cosmwasmClient,
          values.key
        );

        try {
          await cw721Client.nftInfo({ tokenId: values.token_id });
        } catch {
          setError("key", { message: "Cannot find cw721 asset" });
          return;
        }

        cw721Append({
          address: values.key,
          token_ids: [values.token_id!],
        });
        break;
      case "native":
        asset = await getCoinAsset(values.key, assets.assets);
        if (!asset) {
          setError("key", { message: "Cannot find native asset" });
          return;
        }

        const nativeBase = getBaseCoin(
          {
            denom: values.key,
            amount: values.amount!,
          },
          asset
        );

        if (!nativeBase) {
          setError("key", { message: "Could not calculate the base coin" });
          return;
        }

        if (
          getValues(`dues.${index}.balance.native`).find(
            (x) => x.denom == nativeBase.denom
          )
        ) {
          setError("key", { message: "Cannot add duplicates" });
          return;
        }

        nativeAppend(nativeBase);
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
              <Select
                id="type"
                {...register("type", {
                  onChange: (e: any) => {
                    e.persist();

                    setValue("token_id", undefined);
                    setValue("amount", undefined);
                    setValue(
                      "key",
                      e.target.value == "native" ? env.DEFAULT_NATIVE : ""
                    );
                    setKey(undefined); // Do not wait for debounce here

                    setValue("type", e.target.value);
                  },
                })}
              >
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
              <Input id="key" {...register("key")} />
              <FormErrorMessage>{errors.key?.message}</FormErrorMessage>
            </FormControl>
            {watchType == "cw20" && key && isValidContractAddress(key) && (
              <Cw20Card
                cosmwasmClient={cosmwasmClient}
                address={key}
                amount={watchAmount ?? "0"}
              />
            )}
            {watchType == "native" && key && key.length > 0 && (
              <NativeCard denom={key} amount={watchAmount ?? "0"} />
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
              <Input id="token_id" {...register("token_id")} />
              <FormErrorMessage>{errors.token_id?.message}</FormErrorMessage>
            </FormControl>
            {watchType == "cw721" &&
              key &&
              isValidContractAddress(key) &&
              tokenId && (
                <Cw721Card
                  address={key}
                  cosmwasmClient={cosmwasmClient}
                  token_ids={[tokenId]}
                />
              )}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};