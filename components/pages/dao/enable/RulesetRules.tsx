import {
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/form-control";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { Stack } from "@chakra-ui/layout";
import {
  InputGroup,
  Input,
  InputRightElement,
  Tooltip,
  IconButton,
} from "@chakra-ui/react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { FormValues } from "~/pages/dao/enable";

interface DAOEnableRulesetRulesProps {
  rulesetIndex: number;
}

export function DAOEnableRulesetRules({
  rulesetIndex,
}: DAOEnableRulesetRulesProps) {
  const {
    formState: { errors },
    control,
    register,
  } = useFormContext<FormValues, any>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `rulesets.${rulesetIndex}.rules`,
  });

  return (
    <FormControl isInvalid={!!errors.rulesets?.[rulesetIndex]?.rules}>
      <FormLabel>Rules</FormLabel>
      <Stack>
        {fields?.map((_rule, ruleIndex) => (
          <FormControl
            isInvalid={!!errors.rulesets?.[rulesetIndex]?.rules?.[ruleIndex]}
          >
            <InputGroup>
              <Input
                {...register(
                  `rulesets.${rulesetIndex}.rules.${ruleIndex}.rule`
                )}
              />
              <InputRightElement>
                <Tooltip label="Delete Rule">
                  <IconButton
                    aria-label="delete"
                    variant="ghost"
                    icon={<DeleteIcon />}
                    onClick={() => remove(ruleIndex)}
                  />
                </Tooltip>
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>
              {errors.rulesets?.[rulesetIndex]?.rules?.[ruleIndex]?.message}
            </FormErrorMessage>
          </FormControl>
        ))}
        <Tooltip label="Add Rule">
          <IconButton
            variant="ghost"
            colorScheme="secondary"
            aria-label="Add Rule"
            alignSelf="flex-start"
            onClick={() => append({ rule: "" })}
            icon={<AddIcon />}
          />
        </Tooltip>
      </Stack>
      <FormErrorMessage>
        {errors.rulesets?.[rulesetIndex]?.rules?.message}
      </FormErrorMessage>
    </FormControl>
  );
}
