import { ArenaWagerModuleClient } from "@arena/ArenaWagerModule.client";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Textarea,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import env from "@config/env";
import { useChain } from "@cosmos-kit/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Control, useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DistributionSchema } from "@config/schemas";
import { UserOrDAOCard } from "@components/cards/UserOrDAOCard";

const FormSchema = z.object({
  title: z.string().min(1, { message: "Proposal Title cannot be empty" }),
  description: z
    .string()
    .min(1, { message: "Proposal Description cannot be empty" }),
  distribution: DistributionSchema,
});
export type FormValues = z.infer<typeof FormSchema>;

interface WrapperUserOrDAOCardProps {
  cosmwasmClient: CosmWasmClient;
  control: Control<FormValues>;
  index: number;
}

function WrapperUserOrDAOCard({
  cosmwasmClient,
  control,
  index,
}: WrapperUserOrDAOCardProps) {
  let watchAddress = useWatch({ control, name: `distribution.${index}.addr` });

  return (
    <UserOrDAOCard cosmwasmClient={cosmwasmClient} address={watchAddress} />
  );
}

export type ProposalPromptModalAction = "Jail Wager" | "Propose Result";

interface ProposalPromptModalProps {
  id: string;
  module_addr: string;
  isOpen: boolean;
  onClose: () => void;
  cosmwasmClient: CosmWasmClient;
  action: ProposalPromptModalAction;
  setJailedStatus: () => void;
  setHasGeneratedProposals: () => void;
}

export function ProposalPromptModal({
  id,
  isOpen,
  module_addr,
  onClose,
  cosmwasmClient,
  setJailedStatus,
  setHasGeneratedProposals,
  action,
}: ProposalPromptModalProps) {
  const toast = useToast();
  const { getSigningCosmWasmClient, address, isWalletConnected } = useChain(
    env.CHAIN
  );

  const jailWager = async (values: FormValues) => {
    try {
      let cosmwasmClient = await getSigningCosmWasmClient();
      if (!cosmwasmClient) throw "Could not get the CosmWasm client";
      if (!address) throw "Could not get user address";

      let wagerModuleClient = new ArenaWagerModuleClient(
        cosmwasmClient,
        address,
        module_addr
      );

      await wagerModuleClient.jailCompetition({
        proposeMessage: {
          id,
          title: values.title,
          description: values.description,
          distribution: values.distribution,
        },
      });

      toast({
        title: "Success",
        isClosable: true,
        status: "success",
        description: "The competition has been jailed.",
      });

      setJailedStatus();
      onClose();
    } catch (e: any) {
      toast({
        status: "error",
        title: "Error",
        description: e.toString(),
        isClosable: true,
      });
    }
  };

  const proposeResult = async (values: FormValues) => {
    try {
      let cosmwasmClient = await getSigningCosmWasmClient();
      if (!cosmwasmClient) throw "Could not get the CosmWasm client";
      if (!address) throw "Could not get user address";

      let wagerModuleClient = new ArenaWagerModuleClient(
        cosmwasmClient,
        address,
        module_addr
      );

      await wagerModuleClient.proposeResult({
        proposeMessage: {
          id: id,
          title: values.title,
          description: values.description,
          distribution: values.distribution,
        },
      });

      toast({
        title: "Success",
        isClosable: true,
        status: "success",
        description: "The competition's proposals have been generated.",
      });

      setHasGeneratedProposals();
      onClose();
    } catch (e: any) {
      toast({
        status: "error",
        title: "Error",
        description: e.toString(),
        isClosable: true,
      });
    }
  };
  const actionHandlers = {
    "Jail Wager": jailWager,
    "Propose Result": proposeResult,
  };

  const {
    formState: { isSubmitting, errors },
    handleSubmit,
    register,
    control,
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      title: "Competition Result",
      description:
        "This proposal allows members to vote on the winner of the competition. Each choice represents a different team. Select the team that you believe should win the competition.",
      distribution: [{ addr: address, shares: "1" }],
    },
    resolver: zodResolver(FormSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "distribution",
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(actionHandlers[action])}>
          <ModalHeader>{action}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack>
              <FormControl isInvalid={!!errors.title}>
                <FormLabel>Proposal Title</FormLabel>
                <InputGroup>
                  <Input {...register("title")} />
                </InputGroup>
                <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.description}>
                <FormLabel>Proposal Description</FormLabel>
                <InputGroup>
                  <Textarea {...register("description")} />
                </InputGroup>
                <FormErrorMessage>
                  {errors.description?.message}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.distribution}>
                <FormLabel>Distribution</FormLabel>
                <Stack>
                  {fields.map((x, i) => (
                    <Card key={x.id} variant="outline">
                      <CardBody>
                        <Stack>
                          <FormControl
                            isInvalid={!!errors.distribution?.[i]?.addr}
                          >
                            <FormLabel>Address</FormLabel>
                            <InputGroup>
                              <Input {...register(`distribution.${i}.addr`)} />
                            </InputGroup>
                            <FormErrorMessage>
                              {errors.distribution?.[i]?.addr?.message}
                            </FormErrorMessage>
                          </FormControl>
                          <WrapperUserOrDAOCard
                            cosmwasmClient={cosmwasmClient}
                            control={control}
                            index={i}
                          />
                          <FormControl
                            isInvalid={!!errors.distribution?.[i]?.shares}
                          >
                            <FormLabel>Shares</FormLabel>
                            <InputGroup>
                              <Input
                                {...register(`distribution.${i}.shares`)}
                              />
                            </InputGroup>
                            <FormErrorMessage>
                              {errors.distribution?.[i]?.shares?.message}
                            </FormErrorMessage>
                          </FormControl>
                        </Stack>
                      </CardBody>
                      <CardFooter>
                        <Tooltip label="Delete Shares">
                          <IconButton
                            variant="ghost"
                            aria-label="Delete Shares"
                            icon={<DeleteIcon />}
                            onClick={() => remove(i)}
                          />
                        </Tooltip>
                      </CardFooter>
                    </Card>
                  ))}
                </Stack>
                <Tooltip label="Add Shares">
                  <IconButton
                    mt="2"
                    variant="ghost"
                    aria-label="Add Shares"
                    onClick={() =>
                      append({
                        addr: "",
                        shares: "1",
                      })
                    }
                    icon={<AddIcon />}
                  />
                </Tooltip>
                <FormErrorMessage>
                  {errors.distribution?.message}
                </FormErrorMessage>
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button variant="ghost" onClick={() => reset()}>
                Reset
              </Button>
              <Button
                type="submit"
                isDisabled={!isWalletConnected}
                isLoading={isSubmitting}
              >
                Submit
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}