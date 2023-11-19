import { ArenaWagerModuleClient } from "@arena/ArenaWagerModule.client";
import { Evidence } from "@arena/ArenaWagerModule.types";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/form-control";
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
  useToast,
} from "@chakra-ui/react";
import env from "@config/env";
import { useChain } from "@cosmos-kit/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Control, useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
  evidence: z
    .string()
    .min(1, "Evidence cannot be empty")
    .array()
    .min(1, "Evidence array cannot be empty"),
});
type FormValues = z.infer<typeof FormSchema>;

interface EvidenceModalProps {
  competition_id: string;
  isOpen: boolean;
  onClose: () => void;
  address: string;
}

export function EvidenceModal({
  competition_id,
  isOpen,
  onClose,
  address,
}: EvidenceModalProps) {
  const toast = useToast();
  const { isWalletConnected, getSigningCosmWasmClient } = useChain(env.CHAIN);

  const {
    formState: { isSubmitting, errors },
    handleSubmit,
    register,
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      let cosmwasmClient = await getSigningCosmWasmClient();
      if (!cosmwasmClient) throw "Could not get the CosmWasm client";
      if (!address) throw "Could not get user address";

      let wagerClient = new ArenaWagerModuleClient(
        cosmwasmClient,
        address,
        env.ARENA_WAGER_MODULE_ADDRESS
      );

      await wagerClient.submitEvidence({
        evidence: values.evidence,
        id: competition_id,
      });

      toast({
        title: "Success",
        isClosable: true,
        status: "success",
        description: "Evidence has been submitted",
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
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Submit Evidence</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack>
              <FormControl isInvalid={!!errors.evidence}>
                <FormLabel>Evidence</FormLabel>
                <InputGroup>
                  <Input {...register("evidence")} />
                </InputGroup>
                <FormErrorMessage>{errors.evidence?.message}</FormErrorMessage>
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
