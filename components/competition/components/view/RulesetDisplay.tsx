import { Card, CardBody, CardHeader } from "@chakra-ui/card";
import { Heading, ListItem, ListProps, UnorderedList } from "@chakra-ui/layout";
import { Skeleton } from "@chakra-ui/react";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useEffect, useState } from "react";
import env from "~/config/env";
import { ArenaCoreQueryClient } from "~/ts-codegen/arena/ArenaCore.client";
import { useArenaCoreQueryExtensionQuery } from "~/ts-codegen/arena/ArenaCore.react-query";
import { Ruleset } from "~/ts-codegen/arena/ArenaCore.types";

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
	const { data, isLoading, isError } = useArenaCoreQueryExtensionQuery({
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
					<UnorderedList {...listProps}>
						{ruleset?.rules.map((x, i) => {
							return <ListItem key={i}>{x}</ListItem>;
						})}
					</UnorderedList>
				</CardBody>
			</Card>
		</Skeleton>
	);
}
