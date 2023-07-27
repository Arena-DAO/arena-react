import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from "@chakra-ui/form-control";
import { Container, Heading, Stack } from "@chakra-ui/layout";
import { Input } from "@chakra-ui/react";
import { useChain } from "@cosmos-kit/react";
import { DaoCoreQueryClient } from "@dao/DaoCore.client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DAOAddressSchema, ExpirationSchema } from "~/helpers/SchemaHelpers";

const WagerForm = () => {
  const router = useRouter();
  const chainContext = useChain(process.env.NEXT_PUBLIC_CHAIN!);

  const validationSchema = z.object({
    dao: DAOAddressSchema(chainContext.chain.bech32_prefix),
    description: z.string().nonempty(),
    expiration: ExpirationSchema,
    name: z.string().nonempty(),
    rules: z.string().array(),
    ruleset: z.number().optional(),
  });

  type FormValues = z.infer<typeof validationSchema>;

  const {
    register,
    handleSubmit,
    control,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      dao: router.query.dao as string | undefined,
    },
    resolver: zodResolver(validationSchema),
  });

  const onSubmit = async (values: FormValues) => {
    let cosmWasmClient = await chainContext.getSigningCosmWasmClient();
    let daoCoreClient = new DaoCoreQueryClient(cosmWasmClient, values.dao);

    let getItemResponse = await daoCoreClient.getItem({
      key: process.env.NEXT_PUBLIC_ITEM_KEY!,
    });
    if (!getItemResponse.item) {
      setError("dao", {
        message: "The dao does not have the arena module set up.",
      });
      return;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl isInvalid={!!errors.dao}>
        <FormLabel>DAO</FormLabel>
        <Input id="dao" {...register("dao")} />
        <FormErrorMessage>{errors.dao?.message}</FormErrorMessage>
      </FormControl>
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
