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
import { useState } from "react";
import {
  UseFormGetValues,
  useForm,
  UseFieldArrayAppend,
} from "react-hook-form";
import { z } from "zod";
import { AmountSchema, AddressSchema } from "~/helpers/SchemaHelpers";
import { FormValues } from "~/pages/wager/create";
import { DataLoadedResult } from "~/types/DataLoadedResult";

interface WagerCreateDueFormProps extends ModalProps {
  cosmwasmClient: CosmWasmClient;
  isOpen: boolean;
  onClose: () => void;
  index: number;
  getValues: UseFormGetValues<FormValues>;
  cw20Append: UseFieldArrayAppend<FormValues, `dues.0.balance.cw20`>;
  nativeAppend: UseFieldArrayAppend<FormValues, `dues.0.balance.native`>;
  cw721Append: UseFieldArrayAppend<FormValues, `dues.0.balance.cw721`>;
}

export const TokenTypes = z.enum(["cw20", "cw721", "native"]);

export const WagerCreateDueForm = ({
  isOpen,
  cosmwasmClient,
  onClose,
  index,
  cw20Append,
  nativeAppend,
  cw721Append,
  getValues,
  ...modalProps
}: WagerCreateDueFormProps) => {
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