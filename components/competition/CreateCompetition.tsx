import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from "@chakra-ui/form-control";
import { Box, Grid, GridItem, Stack } from "@chakra-ui/layout";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  IconButton,
  Input,
  InputGroup,
  InputRightAddon,
  InputRightElement,
  Select,
  Textarea,
  Tooltip,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FormProvider, useFieldArray, useFormContext } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import moment from "moment-timezone";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { WagerCreateRulesetTable } from "@components/pages/wager/create/RulesetTable";
import { WagerCreateDAOCard } from "@components/pages/wager/create/DAOCard";
import { WagerCreateTeamCard } from "@components/pages/wager/create/TeamCard";
import { CreateCompetitionSchema } from "@config/schemas";

export type FormValues = z.infer<typeof CreateCompetitionSchema>;

interface CreateCompetitionFormProps {
  cosmwasmClient: CosmWasmClient;
}

export default function CreateCompetitionForm({
  cosmwasmClient,
}: CreateCompetitionFormProps) {
  const router = useRouter();

  const formMethods = useFormContext<FormValues, any>();
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = formMethods;
  useEffect(() => {
    if (router.query.dao as string | undefined)
      setValue("dao_address", router.query.dao as string);
  }, [router.query.dao, setValue]);

  const watchExpirationUnits = watch("expiration.expiration_units");

  const {
    fields: duesFields,
    append: duesAppend,
    remove: duesRemove,
  } = useFieldArray({
    name: "dues",
    control,
  });

  const {
    fields: rulesFields,
    append: rulesAppend,
    remove: rulesRemove,
  } = useFieldArray({ name: "rules", control });

  return (
    <>
      <FormControl isInvalid={!!errors.dao_address}>
        <FormLabel>DAO</FormLabel>
        <Input id="dao_address" {...register("dao_address")} />
        <FormErrorMessage>{errors.dao_address?.message}</FormErrorMessage>
      </FormControl>
      <WagerCreateDAOCard cosmwasmClient={cosmwasmClient} control={control} />
      <FormControl isInvalid={!!errors.name}>
        <FormLabel>Name</FormLabel>
        <Input id="name" {...register("name")} />
        <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={!!errors.description}>
        <FormLabel>Description</FormLabel>
        <Textarea id="description" {...register("description")} />
        <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
      </FormControl>
      <Grid
        templateColumns={useBreakpointValue({
          base: "1fr",
          sm: "repeat(2, 1fr)",
          xl: "repeat(4, 1fr)",
        })}
        gap="2"
        alignItems="flex-start"
      >
        <GridItem>
          <FormControl
            isInvalid={
              !!errors.expiration?.expiration_units || !!errors.expiration
            }
          >
            <FormLabel>Expiration</FormLabel>
            <Select {...register("expiration.expiration_units")}>
              <option value="At Time">At Time</option>
              <option value="At Height">At Height</option>
              <option value="Never">Never</option>
            </Select>
            <FormErrorMessage>
              {errors.expiration?.expiration_units?.message ??
                errors.expiration?.message}
            </FormErrorMessage>
          </FormControl>
        </GridItem>
        {watchExpirationUnits == "At Time" && (
          <>
            <GridItem>
              <FormControl isInvalid={!!errors.expiration?.time}>
                <FormLabel>Time</FormLabel>
                <Input type="datetime-local" {...register("expiration.time")} />
                <FormErrorMessage>
                  {errors.expiration?.time?.message}
                </FormErrorMessage>
              </FormControl>
            </GridItem>
            <GridItem>
              <FormControl isInvalid={!!errors.expiration?.timezone}>
                <FormLabel>Timezone</FormLabel>
                <Select {...register("expiration.timezone")}>
                  {moment.tz.names().map((timezone) => (
                    <option key={timezone} value={timezone}>
                      {timezone}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>
                  {errors.expiration?.timezone?.message}
                </FormErrorMessage>
              </FormControl>
            </GridItem>
          </>
        )}
        {watchExpirationUnits == "At Height" && (
          <GridItem>
            <FormControl isInvalid={!!errors.expiration?.height}>
              <FormLabel>Height</FormLabel>
              <InputGroup>
                <Input
                  type="number"
                  {...register("expiration.height", {
                    setValueAs: (x) => (x === "" ? undefined : parseInt(x)),
                  })}
                />
                <InputRightAddon>blocks</InputRightAddon>
              </InputGroup>
              <FormErrorMessage>
                {errors.expiration?.height?.message}
              </FormErrorMessage>
            </FormControl>
          </GridItem>
        )}
      </Grid>
      <WagerCreateRulesetTable
        cosmwasmClient={cosmwasmClient}
        control={control}
      />
      <FormControl isInvalid={!!errors.rules}>
        <FormLabel>Rules</FormLabel>
        <Stack>
          {rulesFields?.map((rule, ruleIndex) => (
            <FormControl
              key={rule.id}
              isInvalid={!!errors.rules?.[ruleIndex]?.rule}
            >
              <InputGroup>
                <Input {...register(`rules.${ruleIndex}.rule`)} />
                <InputRightElement>
                  <Tooltip label="Delete Rule">
                    <IconButton
                      aria-label="delete"
                      variant="ghost"
                      icon={<DeleteIcon />}
                      onClick={() => rulesRemove(ruleIndex)}
                    />
                  </Tooltip>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>
                {errors.rules?.[ruleIndex]?.rule?.message}
              </FormErrorMessage>
            </FormControl>
          ))}
          <Tooltip label="Add Rule">
            <IconButton
              variant="ghost"
              colorScheme="secondary"
              aria-label="Add Rule"
              alignSelf="flex-start"
              onClick={() => rulesAppend({ rule: "" })}
              icon={<AddIcon />}
            />
          </Tooltip>
        </Stack>
        <FormErrorMessage>{errors.rules?.message}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={!!errors.dues}>
        <FormLabel>Dues</FormLabel>
        <Stack>
          <FormProvider {...formMethods}>
            {duesFields.map((dues, dueIndex: number) => {
              return (
                <WagerCreateTeamCard
                  key={dues.id}
                  index={dueIndex}
                  cosmwasmClient={cosmwasmClient}
                  duesRemove={() => duesRemove(dueIndex)}
                />
              );
            })}
          </FormProvider>
        </Stack>
        <Tooltip label="Add Team">
          <IconButton
            mt="2"
            variant="ghost"
            colorScheme="secondary"
            aria-label="Add Team"
            onClick={() =>
              duesAppend({
                addr: "",
                balance: {
                  cw20: [],
                  cw721: [],
                  native: [],
                },
              })
            }
            icon={<AddIcon />}
          />
        </Tooltip>
        <FormErrorMessage>{errors.dues?.message}</FormErrorMessage>
      </FormControl>
      <Accordion allowMultiple>
        <AccordionItem>
          <AccordionButton>
            <Box as="span" flex="1" textAlign="left">
              Competition DAO Details <small>(optional)</small>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <Stack>
              <FormControl isInvalid={!!errors.competition_dao_name}>
                <FormLabel>Name</FormLabel>
                <InputGroup>
                  <Input {...register("competition_dao_name")} />
                </InputGroup>
                <FormErrorMessage>
                  {errors.competition_dao_name?.message}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.competition_dao_description}>
                <FormLabel>Description</FormLabel>
                <InputGroup>
                  <Textarea {...register("competition_dao_description")} />
                </InputGroup>
                <FormErrorMessage>
                  {errors.competition_dao_description?.message}
                </FormErrorMessage>
              </FormControl>
            </Stack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </>
  );
}
