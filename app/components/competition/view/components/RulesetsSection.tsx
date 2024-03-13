"use client";

import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { ArenaCoreQueryClient } from "~/codegen/ArenaCore.client";
import { useArenaCoreQueryExtensionQuery } from "~/codegen/ArenaCore.react-query";
import type { Ruleset } from "~/codegen/ArenaCore.types";
import { useEnv } from "~/hooks/useEnv";
import type { WithClient } from "~/types/util";

interface RulesetsSectionProps {
	rulesetId: string;
}

const RulesetsSection = ({
	rulesetId,
	cosmWasmClient,
}: WithClient<RulesetsSectionProps>) => {
	const { data: env } = useEnv();
	const { data } = useArenaCoreQueryExtensionQuery({
		client: new ArenaCoreQueryClient(cosmWasmClient, env.ARENA_CORE_ADDRESS),
		args: { msg: { ruleset: { id: rulesetId } } },
	});
	const parsedData = data ? (data as unknown as Ruleset) : undefined;

	return (
		<Card>
			<CardHeader>Ruleset {rulesetId}</CardHeader>
			<CardBody className="space-y-2">
				<p>{parsedData?.description}</p>
				<ol className="list-inside list-decimal">
					{parsedData?.rules.map((rule) => (
						<li>{rule}</li>
					))}
				</ol>
			</CardBody>
		</Card>
	);
};

export default RulesetsSection;
