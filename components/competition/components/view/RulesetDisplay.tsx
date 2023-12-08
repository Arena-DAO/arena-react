import { ArenaCoreQueryClient } from "@arena/ArenaCore.client";
import { useArenaCoreQueryExtensionQuery } from "@arena/ArenaCore.react-query";
import { Ruleset } from "@arena/ArenaCore.types";
import { Card, CardBody, CardHeader } from "@chakra-ui/card";
import { Heading, List, ListItem, ListProps } from "@chakra-ui/layout";
import { Skeleton } from "@chakra-ui/react";
import env from "@config/env";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useEffect, useState } from "react";

interface RulesetDisplayProps {
  cosmwasmClient: CosmWasmClient;
  ruleset_id: string;
  listProps: ListProps;
}

export function RulesetDisplay({
  cosmwasmClient,
  ruleset_id,
  listProps,
}: RulesetDisplayProps) {
  let { data, isLoading, isError } = useArenaCoreQueryExtensionQuery({
    client: new ArenaCoreQueryClient(cosmwasmClient, env.ARENA_CORE_ADDRESS),
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
            {ruleset?.description}
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
