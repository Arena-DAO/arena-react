import {
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/form-control";
import { Box, Container, Heading, Stack } from "@chakra-ui/layout";
import { Button, Input, useToast } from "@chakra-ui/react";
import env from "@config/env";
import { AddressSchema } from "@config/schemas";
import { useChain } from "@cosmos-kit/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
  address: AddressSchema,
});
type FormValues = z.infer<typeof FormSchema>;

export default function Faucet() {
  const { address } = useChain(env.CHAIN);
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      address: address,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await fetch(env.FAUCET_URL + values.address);
      if (!response.ok) {
        throw new Error("Could not request funds from the faucet");
      }
      toast({
        status: "success",
        title: "Success",
        description: "Your account has successfully received funds",
        isClosable: true,
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

  if (!env.FAUCET_URL) return null;
  return (
    <Container maxW={{ base: "full", md: "5xl" }} centerContent pb={10}>
      <Heading>Juno Testnet Faucet</Heading>
      <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
        <Stack>
          <FormControl isInvalid={!!errors.address}>
            <FormLabel>Address</FormLabel>
            <Input {...register("address")} />
            <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
          </FormControl>
          <Box mt="2">
            <Button
              type="submit"
              colorScheme="secondary"
              isLoading={isSubmitting}
            >
              Submit
            </Button>
          </Box>
        </Stack>
      </form>
    </Container>
  );
}
