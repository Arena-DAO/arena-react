import { ArenaWagerModuleClient } from "@arena/ArenaWagerModule.client";
import { CompetitionStatus } from "@arena/ArenaWagerModule.types";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
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
  useToast,
} from "@chakra-ui/react";
import env from "@config/env";
import { useChain } from "@cosmos-kit/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
  proposal_title: z
    .string()
    .nonempty({ message: "Proposal Title cannot be empty" }),
  proposal_description: z
    .string()
    .nonempty({ message: "Proposal Description cannot be empty" }),
});
type FormValues = z.infer<typeof FormSchema>;

export type WagerViewProposalPromptModalAction =
  | "Jail Wager"
  | "Generate Proposals";

interface WagerViewProposalPromptModalProps {
  id: string;
  module_addr: string;
  isOpen: boolean;
  onClose: () => void;
  action: WagerViewProposalPromptModalAction;
  setJailedStatus: () => void;
  setHasGeneratedProposals: () => void;
}

export function WagerViewProposalPromptModal({
  id,
  isOpen,
  module_addr,
  onClose,
  setJailedStatus,
  setHasGeneratedProposals,
  action,
}: WagerViewProposalPromptModalProps) {
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
        id: id,
        proposalDetails: {
          title: values.proposal_title,
          description: values.proposal_description,
        },
      });

      toast({
        title: "Success",
        isClosable: true,
        status: "success",
        description: "The competition has been jailed.",
      });

      setJailedStatus();
    } catch (e: any) {
      toast({
        status: "error",
        title: "Error",
        description: e.toString(),
        isClosable: true,
      });
    }
  };

  const generateProposals = async (values: FormValues) => {
    try {
      let cosmwasmClient = await getSigningCosmWasmClient();
      if (!cosmwasmClient) throw "Could not get the CosmWasm client";
      if (!address) throw "Could not get user address";

      console.log(module_addr);
      let wagerModuleClient = new ArenaWagerModuleClient(
        cosmwasmClient,
        address,
        module_addr
      );

      await wagerModuleClient.generateProposals({
        id: id,
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

      setHasGeneratedProposals();
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
    "Generate Proposals": generateProposals,
  };

  const {
    formState: { isSubmitting, errors },
    handleSubmit,
    register,
  } = useForm<FormValues>({
    defaultValues: {
      proposal_title: "Competition Result",
      proposal_description:
        "This proposal allows members to vote on the winner of the competition. Each choice represents a different team. Select the team that you believe should win the competition.",
    },
    resolver: zodResolver(FormSchema),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(actionHandlers[action])}>
          <ModalHeader>{action}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack>
              <FormControl isInvalid={!!errors.proposal_title}>
                <FormLabel>Proposal Title</FormLabel>
                <InputGroup>
                  <Input {...register("proposal_title")} />
                </InputGroup>
                <FormErrorMessage>
                  {errors.proposal_title?.message}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.proposal_description}>
                <FormLabel>Proposal Description</FormLabel>
                <InputGroup>
                  <Textarea {...register("proposal_description")} />
                </InputGroup>
                <FormErrorMessage>
                  {errors.proposal_description?.message}
                </FormErrorMessage>
              </FormControl>
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
