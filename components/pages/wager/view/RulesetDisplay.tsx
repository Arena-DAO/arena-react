import { ArenaCoreQueryClient } from "@arena/ArenaCore.client";
import { useArenaCoreQueryExtensionQuery } from "@arena/ArenaCore.react-query";
import { Ruleset } from "@arena/ArenaCore.types";
import { Card, CardBody, CardHeader } from "@chakra-ui/card";
import { Heading, List, ListItem, ListProps } from "@chakra-ui/layout";
import { Skeleton } from "@chakra-ui/react";
import { CosmWasmClient, fromBinary } from "@cosmjs/cosmwasm-stargate";
import { useEffect, useState } from "react";

interface RulesetDisplayProps {
  cosmwasmClient: CosmWasmClient;
  arena_core_addr: string;
  ruleset_id: string;
  listProps: ListProps;
}

export function RulesetDisplay({
  cosmwasmClient,
  arena_core_addr,
  ruleset_id,
  listProps,
}: RulesetDisplayProps) {
  let { data, isLoading, isError } = useArenaCoreQueryExtensionQuery({
    client: new ArenaCoreQueryClient(cosmwasmClient, arena_core_addr),
    args: { msg: { ruleset: { id: ruleset_id } } },
  });
  const [ruleset, setRuleset] = useState<Ruleset>();
  useEffect(() => {
    if (data) setRuleset(data as unknown as Ruleset | undefined);
  }, [data]);

  if (isError) return null;
  return (
    <Skeleton isLoaded={!isLoading}>
      <Card variant="outline">
        <CardHeader pb="0">
          <Heading mb="0" size="sm">
            Ruleset {ruleset_id}
          </Heading>
        </CardHeader>
        <CardBody>
          <List {...listProps}>
            {ruleset?.rules.map((x, i) => {
              return <ListItem key={i}>{x}</ListItem>;
            })}
          </List>
        </CardBody>
      </Card>
    </Skeleton>
  );
}
