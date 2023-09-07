import { ArenaCoreQueryClient } from "@arena/ArenaCore.client";
import { useArenaCoreQueryExtensionQuery } from "@arena/ArenaCore.react-query";
import { Ruleset } from "@arena/ArenaCore.types";
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
import { useMemo, useEffect, useState, useCallback } from "react";
import {
  UseFormSetError,
  UseFormClearErrors,
  Control,
  useWatch,
} from "react-hook-form";
import { AddressSchema } from "~/helpers/SchemaHelpers";
import { FormValues } from "~/pages/wager/create";

interface RulesetProps {
  cosmwasmClient: CosmWasmClient;
  onRulesetSelect: (id: number | undefined) => void;
}

interface RulesetTableProps extends RulesetProps, TableContainerProps {
  onArenaCoreLoaded: (data: string | undefined) => void;
  setError: UseFormSetError<{ dao_address: string }>;
  clearErrors: UseFormClearErrors<{ dao_address: string }>;
  control: Control<FormValues>;
}

interface RulesetTableInnerProps extends RulesetProps {
  start_after?: number | null;
  selectedRuleset: number | undefined;
  setLastRuleset: (data: number | null) => void;
  addr: string;
}

function RulesetTableInner({
  addr,
  cosmwasmClient,
  onRulesetSelect,
  setLastRuleset,
  selectedRuleset,
  start_after,
}: RulesetTableInnerProps) {
  const { data, isError } = useArenaCoreQueryExtensionQuery({
    client: new ArenaCoreQueryClient(cosmwasmClient, addr),
    args: { msg: { rulesets: { start_after } } },
  });
  const parseRulesets = useMemo(() => {
    if (!data) return [];
    let rulesets: [number, Ruleset][] = [];
    try {
      rulesets = fromBinary(data) as [number, Ruleset][];
    } catch {}

    return rulesets;
  }, [data]);
  useEffect(() => {
    if (data) {
      let rulesets = parseRulesets;
      let largestNumber = 0;

      if (rulesets.length > 0) {
        largestNumber = Math.max(...rulesets.map(([number]) => number));
      }

      setLastRuleset(largestNumber);
    } else setLastRuleset(null);
  }, [data, setLastRuleset, parseRulesets]);

  if (isError) return null;

  const rulesets = parseRulesets;
  return (
    <>
      {rulesets.map((ruleset) => (
        <Tr key={ruleset[0]}>
          <Td>{ruleset[1].description}</Td>
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
                      {ruleset[1].rules.map((rule, index) => (
                        <ListItem key={index}>{rule}</ListItem>
                      ))}
                    </UnorderedList>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
              {selectedRuleset != ruleset[0] && (
                <Button onClick={() => onRulesetSelect(ruleset[0])}>
                  Select
                </Button>
              )}
              {selectedRuleset == ruleset[0] && (
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
  const [selectedRuleset, setSelectedRuleset] = useState<number | undefined>(
    undefined
  );
  const [pages, setPages] = useState<Set<number | null>>(
    new Set<number | null>([null])
  );

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
  const [hasFetched, setHasFetched] = useState<boolean>(false);
  const handleSetLastPage = useCallback((x: number | null) => {
    setPages((prevPages) => {
      const newPages = new Set(prevPages);
      newPages.add(x);
      return newPages;
    });
    setHasFetched(true);
  }, []);

  if (!query.isFetched || query.isError || (hasFetched && pages.size == 1)) {
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
                <>
                  {Array.from(pages).map((page, i) => {
                    return (
                      <RulesetTableInner
                        key={i}
                        addr={query.data.item!}
                        cosmwasmClient={cosmwasmClient}
                        onRulesetSelect={setSelectedRuleset}
                        selectedRuleset={selectedRuleset}
                        setLastRuleset={handleSetLastPage}
                        start_after={page}
                      />
                    );
                  })}
                </>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </FormControl>
    </Skeleton>
  );
}
