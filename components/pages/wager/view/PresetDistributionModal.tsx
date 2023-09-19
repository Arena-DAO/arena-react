import { ArenaEscrowClient } from "@arena/ArenaEscrow.client";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/form-control";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { Heading, Stack } from "@chakra-ui/layout";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  InputGroup,
  Input,
  ModalFooter,
  Button,
  Tooltip,
  IconButton,
  useToast,
  Card,
  CardFooter,
  CardHeader,
  CardBody,
} from "@chakra-ui/react";
import { UserOrDAOCard } from "@components/cards/UserOrDAOCard";
import env from "@config/env";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useChain } from "@cosmos-kit/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Control, useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { isValidBech32Address } from "~/helpers/AddressHelpers";

const FormSchema = z.object({
  member_shares: z
    .object({
      addr: z.string().nonempty({ message: "Address is required" }),
      shares: z.string().nonempty({ message: "Shares are required" }),
    })
    .array()
    .min(1, { message: "At least one member share must be provided" }),
});
type FormValues = z.infer<typeof FormSchema>;

interface WagerViewPresetDistributionModalProps {
  escrow_addr: string;
  cosmwasmClient: CosmWasmClient;
  isOpen: boolean;
  onClose: () => void;
}

interface WagerViewUserOrDAOCardProps {
  control: Control<FormValues, any>;
  index: number;
  cosmwasmClient: CosmWasmClient;
}

function WagerViewUserOrDAOCard({
  control,
  index,
  cosmwasmClient,
}: WagerViewUserOrDAOCardProps) {
  const address = useWatch({ control, name: `member_shares.${index}.addr` });

  if (!isValidBech32Address(address)) return null;
  return <UserOrDAOCard cosmwasmClient={cosmwasmClient} address={address} />;
}

export function WagerViewPresetDistributionModal({
  escrow_addr,
  cosmwasmClient,
  isOpen,
  onClose,
}: WagerViewPresetDistributionModalProps) {
  const toast = useToast();
  const { isWalletConnected, getSigningCosmWasmClient, address } = useChain(
    env.CHAIN
  );
  const {
    formState: { isSubmitting, errors },
    handleSubmit,
    control,
    register,
    reset,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      member_shares: [],
    },
    resolver: zodResolver(FormSchema),
  });

  const { fields, append, remove } = useFieldArray({
    name: "member_shares",
    control,
  });

  const onSubmit = async (values: FormValues) => {
    try {
      let cosmwasmClient = await getSigningCosmWasmClient();
      if (!cosmwasmClient) throw "Could not get the CosmWasm client";
      if (!address) throw "Could not get user address";

      let escrowClient = new ArenaEscrowClient(
        cosmwasmClient,
        address,
        escrow_addr
      );

      await escrowClient.setDistribution({
        distribution: values.member_shares,
      });

      toast({
        title: "Success",
        isClosable: true,
        status: "success",
        description: "The competition has been jailed.",
      });
      reset();
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
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Create Preset Distribution</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack>
              {fields.map((x, i) => (
                <Card variant="outline" key={x.id}>
                  <CardHeader>
                    <Heading size="md">Member {i + 1}</Heading>
                  </CardHeader>
                  <CardBody>
                    <Stack>
                      <FormControl
                        isInvalid={!!errors.member_shares?.[i]?.addr}
                      >
                        <FormLabel>Address</FormLabel>
                        <InputGroup>
                          <Input {...register(`member_shares.${i}.addr`)} />
                        </InputGroup>
                        <FormErrorMessage>
                          {errors.member_shares?.[i]?.addr?.message}
                        </FormErrorMessage>
                      </FormControl>
                      <WagerViewUserOrDAOCard
                        cosmwasmClient={cosmwasmClient}
                        index={i}
                        control={control}
                      />
                      <FormControl
                        isInvalid={!!errors.member_shares?.[i]?.shares}
                      >
                        <FormLabel>Shares</FormLabel>
                        <InputGroup>
                          <Input
                            type="number"
                            {...register(`member_shares.${i}.shares`)}
                          />
                        </InputGroup>
                        <FormErrorMessage>
                          {errors.member_shares?.[i]?.shares?.message}
                        </FormErrorMessage>
                      </FormControl>
                    </Stack>
                  </CardBody>
                  <CardFooter>
                    <Tooltip label="Delete Member">
                      <IconButton
                        aria-label="delete"
                        variant="ghost"
                        icon={<DeleteIcon />}
                        onClick={() => remove(i)}
                      />
                    </Tooltip>
                  </CardFooter>
                </Card>
              ))}
              <Tooltip label="Add Member">
                <IconButton
                  variant="ghost"
                  colorScheme="secondary"
                  aria-label="add"
                  alignSelf="flex-start"
                  onClick={() => append({ addr: "", shares: "1" })}
                  icon={<AddIcon />}
                />
              </Tooltip>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              type="submit"
              isDisabled={!isWalletConnected}
              isLoading={isSubmitting}
            >
              Submit
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
