import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { UnorderedList, ListItem } from "@chakra-ui/layout";
import {
  TableContainerProps,
  Tr,
  Td,
  ButtonGroup,
  Popover,
  PopoverTrigger,
  Button,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Skeleton,
  TableContainer,
  Table,
  Thead,
  Th,
  Tbody,
} from "@chakra-ui/react";
import { DaoDaoCoreQueryClient } from "@dao/DaoDaoCore.client";
import { useDaoDaoCoreGetItemQuery } from "@dao/DaoDaoCore.react-query";
import { CosmWasmClient, fromBinary } from "@cosmjs/cosmwasm-stargate";
import env from "@config/env";
import { useEffect, useState } from "react";
import {
  UseFormSetError,
  UseFormClearErrors,
  Control,
  useWatch,
} from "react-hook-form";
import { AddressSchema } from "~/helpers/SchemaHelpers";
import { FormValues } from "~/pages/wager/create";
import { useAllRulesets } from "~/hooks/useAllRulesets";

interface RulesetProps {
  cosmwasmClient: CosmWasmClient;
  onRulesetSelect: (id: string | undefined) => void;
}

interface RulesetTableProps extends RulesetProps, TableContainerProps {
  onArenaCoreLoaded: (data: string | undefined) => void;
  setError: UseFormSetError<{ dao_address: string }>;
  clearErrors: UseFormClearErrors<{ dao_address: string }>;
  control: Control<FormValues>;
}

interface RulesetTableInnerProps extends RulesetProps {
  selectedRuleset: string | undefined;
  arena_core_addr: string;
  setRulesetsCount: (count: number) => void;
}

function RulesetTableInner({
  arena_core_addr,
  cosmwasmClient,
  onRulesetSelect,
  selectedRuleset,
  setRulesetsCount,
}: RulesetTableInnerProps) {
  const rulesets = useAllRulesets(cosmwasmClient, arena_core_addr, (count) =>
    setRulesetsCount(count)
  );

  return (
    <>
      {rulesets.map((ruleset) => (
        <Tr key={ruleset.id}>
          <Td>{ruleset.description}</Td>
          <Td>
            <ButtonGroup>
              <Popover>
                <PopoverTrigger>
                  <Button>View</Button>
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverHeader>Rules</PopoverHeader>
                  <PopoverBody>
                    <UnorderedList>
                      {ruleset.rules.map((rule, index) => (
                        <ListItem key={index}>{rule}</ListItem>
                      ))}
                    </UnorderedList>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
              {selectedRuleset != ruleset.id && (
                <Button onClick={() => onRulesetSelect(ruleset.id)}>
                  Select
                </Button>
              )}
              {selectedRuleset == ruleset.id && (
                <Button onClick={() => onRulesetSelect(undefined)}>
                  Unselect
                </Button>
              )}
            </ButtonGroup>
          </Td>
        </Tr>
      ))}
    </>
  );
}

export function WagerCreateRulesetTable({
  cosmwasmClient,
  control,
  onRulesetSelect,
  setError,
  onArenaCoreLoaded,
  clearErrors,
  ...props
}: RulesetTableProps) {
  let watchDAOAddress = useWatch({ control, name: "dao_address" });
  const query = useDaoDaoCoreGetItemQuery({
    client: new DaoDaoCoreQueryClient(cosmwasmClient, watchDAOAddress),
    args: { key: env.ARENA_ITEM_KEY },
    options: { enabled: false },
  });
  const [selectedRuleset, setSelectedRuleset] = useState<string | undefined>(
    undefined
  );
  const [rulesetsCount, setRulesetsCount] = useState<number>();

  useEffect(() => {
    if (AddressSchema.safeParse(watchDAOAddress).success) query.refetch();
  }, [watchDAOAddress, query]);
  useEffect(() => {
    onRulesetSelect(selectedRuleset);
    setSelectedRuleset(selectedRuleset);
  }, [selectedRuleset, onRulesetSelect]);

  useEffect(() => {
    if (query.isError || (query.data && !query.data.item))
      setError("dao_address", {
        message: "The dao does not have an arena core extension",
      });
    else clearErrors("dao_address");
  }, [query.isError, query.data, setError, clearErrors]);

  useEffect(() => {
    if (query.data && query.data.item) {
      onArenaCoreLoaded(query.data.item);
    } else {
      onArenaCoreLoaded(undefined);
    }
  }, [query.data, onArenaCoreLoaded]);

  if (!query.isFetched || query.isError || rulesetsCount === 0) {
    return null;
  }

  return (
    <Skeleton isLoaded={!query.isLoading}>
      <FormControl>
        <FormLabel>Rulesets</FormLabel>
        <TableContainer {...props}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Description</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {query.data && query.data.item && (
                <RulesetTableInner
                  selectedRuleset={selectedRuleset}
                  arena_core_addr={query.data.item}
                  setRulesetsCount={function (count: number): void {
                    setRulesetsCount(count);
                  }}
                  cosmwasmClient={cosmwasmClient}
                  onRulesetSelect={function (id: string | undefined): void {
                    setSelectedRuleset(id);
                  }}
                />
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </FormControl>
    </Skeleton>
  );
}
