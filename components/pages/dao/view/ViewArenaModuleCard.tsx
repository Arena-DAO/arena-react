import { Card, CardHeader, CardBody, CardFooter } from "@chakra-ui/card";
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from "@chakra-ui/form-control";
import { Flex, Heading, Spacer } from "@chakra-ui/layout";
import { Input, Button } from "@chakra-ui/react";
import env from "@config/env";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
  id: z.number().positive({ message: "Id must be a positive number" }),
});
type FormValues = z.infer<typeof FormSchema>;

interface DAOViewViewArenaModuleCardProps {
  module_key: string;
  dao: string;
  competition_count: string;
}

export function DAOViewViewArenaModuleCard({
  module_key,
  dao,
  competition_count,
}: DAOViewViewArenaModuleCardProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();
  const router = useRouter();

  let path = "";
  switch (module_key) {
    case env.WAGER_MODULE_KEY:
      path = "wager";
      break;
  }

  const onSubmit = (values: FormValues) => {
    router.push(`/${path}/view?dao=${dao}&id=${values.id}`);
  };

  return (
    <Card>
      <CardHeader>
        <Flex>
          <Heading size="md">View Wager</Heading> <Spacer />
          <small>Competition Count: {competition_count}</small>
        </Flex>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardBody>
          <FormControl isInvalid={!!errors.id}>
            <FormLabel>Id</FormLabel>
            <Input type="number" {...register("id")}></Input>
            <FormErrorMessage>{errors.id?.message}</FormErrorMessage>
          </FormControl>
        </CardBody>
        <CardFooter>
          <Button type="submit">View</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
