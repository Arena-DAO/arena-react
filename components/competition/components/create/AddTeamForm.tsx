import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardProps,
} from "@chakra-ui/card";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/form-control";
import { DeleteIcon, AddIcon } from "@chakra-ui/icons";
import { Flex, Heading, Spacer, Stack, StackDivider } from "@chakra-ui/layout";
import { Tooltip, IconButton, Input, useDisclosure } from "@chakra-ui/react";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import {
  UseFieldArrayRemove,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { AddDueForm } from "./AddDueForm";
import { NativeCard } from "@components/cards/NativeCard";
import { Cw20Card } from "@components/cards/Cw20Card";
import { Cw721Card } from "@components/cards/Cw721Card";
import {
  CreateCompetitionFormValues,
  FormComponentProps,
} from "@components/competition/CreateCompetitionForm";
import { UserOrDAOCard } from "@components/cards/UserOrDAOCard";

interface AddTeamFormProps {
  cosmwasmClient: CosmWasmClient;
  duesRemove: UseFieldArrayRemove;
  index: number;
}

interface WrapperUserOrDAOCardProps extends FormComponentProps {
  index: number;
}

export function WrapperUserOrDAOCard({
  cosmwasmClient,
  control,
  index,
}: WrapperUserOrDAOCardProps) {
  let watchAddress = useWatch({ control, name: `dues.${index}.addr` });

  return (
    <UserOrDAOCard cosmwasmClient={cosmwasmClient} address={watchAddress} />
  );
}

export function AddTeamForm({
  cosmwasmClient,
  duesRemove,
  index,
}: AddTeamFormProps) {
  const {
    formState: { errors },
    control,
    register,
    getValues,
  } = useFormContext<CreateCompetitionFormValues, any>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    fields: nativeFields,
    remove: nativeRemove,
    append: nativeAppend,
  } = useFieldArray({
    control,
    name: `dues.${index}.balance.native` as "dues.0.balance.native",
  });
  const {
    fields: cw20Fields,
    remove: cw20Remove,
    append: cw20Append,
  } = useFieldArray({
    control,
    name: `dues.${index}.balance.cw20` as "dues.0.balance.cw20",
  });
  const {
    fields: cw721Fields,
    remove: cw721Remove,
    append: cw721Append,
  } = useFieldArray({
    control,
    name: `dues.${index}.balance.cw721` as "dues.0.balance.cw721",
  });

  const childCardProps: CardProps = { p: 4 };

  return (
    <Card variant={"outline"}>
      <CardHeader pb="0">
        <Flex>
          <Heading size="md">Team {index + 1}</Heading>
          <Spacer />
          <Tooltip label="Delete Team">
            <IconButton
              aria-label="delete"
              variant="ghost"
              icon={<DeleteIcon />}
              onClick={() => duesRemove(index)}
            />
          </Tooltip>
        </Flex>
      </CardHeader>
      <CardBody>
        <Stack>
          <FormControl isInvalid={!!errors.dues?.[index]?.addr}>
            <FormLabel>Address</FormLabel>
            <Input {...register(`dues.${index}.addr` as const)} />
            <FormErrorMessage>
              {errors.dues?.[index]?.addr?.message}
            </FormErrorMessage>
          </FormControl>
          <WrapperUserOrDAOCard
            cosmwasmClient={cosmwasmClient}
            control={control}
            index={index}
          />
          <FormControl isInvalid={!!errors.dues?.[index]?.balance}>
            <FormLabel mb="0">Balance</FormLabel>
            <Card variant="unstyled" p={4} border="none">
              <CardBody>
                <Stack divider={<StackDivider />}>
                  {nativeFields.length > 0 && (
                    <Stack>
                      <Heading size="xs">Native Tokens</Heading>
                      {nativeFields.map((x) => (
                        <NativeCard
                          key={x.id}
                          denom={x.denom}
                          amount={x.amount}
                          deleteFn={(index: number) => {
                            nativeRemove(index);
                          }}
                          index={index}
                          {...childCardProps}
                        />
                      ))}
                    </Stack>
                  )}
                  {cw20Fields.length > 0 && (
                    <Stack>
                      <Heading size="xs">Cw20 Tokens</Heading>
                      {cw20Fields.map((x) => (
                        <Cw20Card
                          key={x.id}
                          cosmwasmClient={cosmwasmClient}
                          address={x.address}
                          amount={x.amount}
                          deleteFn={(index: number) => {
                            cw20Remove(index);
                          }}
                          index={index}
                          {...childCardProps}
                        />
                      ))}
                    </Stack>
                  )}
                  {cw721Fields.length > 0 && (
                    <Stack>
                      <Heading size="xs">Cw721 Tokens</Heading>
                      {cw721Fields.map((x) => (
                        <Cw721Card
                          key={x.id}
                          cosmwasmClient={cosmwasmClient}
                          address={x.address}
                          token_ids={x.token_ids}
                          deleteFn={(index: number) => {
                            cw721Remove(index);
                          }}
                          index={index}
                          {...childCardProps}
                        />
                      ))}
                    </Stack>
                  )}
                </Stack>
              </CardBody>
            </Card>
            <FormErrorMessage>
              {errors.dues?.[index]?.balance?.message}
            </FormErrorMessage>
          </FormControl>
        </Stack>
      </CardBody>
      <CardFooter>
        <Tooltip label="Add Amount">
          <IconButton
            aria-label="add"
            variant="ghost"
            icon={<AddIcon />}
            onClick={() => {
              onOpen();
            }}
          />
        </Tooltip>
        <AddDueForm
          isOpen={isOpen}
          onClose={onClose}
          cosmwasmClient={cosmwasmClient}
          index={index}
          getValues={getValues}
          nativeAppend={nativeAppend}
          cw20Append={cw20Append}
          cw721Append={cw721Append}
        >
          <></>
        </AddDueForm>
      </CardFooter>
    </Card>
  );
}
