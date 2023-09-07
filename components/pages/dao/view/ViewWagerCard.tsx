import { Card, CardHeader, CardBody, CardFooter } from "@chakra-ui/card";
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from "@chakra-ui/form-control";
import { Heading } from "@chakra-ui/layout";
import { Input, Button } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
  id: z.number().positive({ message: "Id must be a positive number" }),
});
type FormValues = z.infer<typeof FormSchema>;

interface DAOViewViewWagerCardProps {
  dao: string;
}

export function DAOViewViewWagerCard({ dao }: DAOViewViewWagerCardProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();
  const router = useRouter();

  const onSubmit = (values: FormValues) => {
    router.push(`/wager/view?dao=${dao}&id=${values.id}`);
  };

  return (
    <Card>
      <CardHeader>
        <Heading size="md">View Wager</Heading>
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
