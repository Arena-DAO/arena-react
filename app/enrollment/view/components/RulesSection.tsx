import { Accordion, AccordionItem } from "@nextui-org/react";
import type React from "react";
import { useMemo } from "react";
import { ArenaCoreQueryClient } from "~/codegen/ArenaCore.client";
import { useArenaCoreQueryExtensionQuery } from "~/codegen/ArenaCore.react-query";
import type { Ruleset } from "~/codegen/ArenaCore.types";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

interface RulesSectionProps {
	rules: string[];
	rulesets: string[];
	category_id?: string | null;
}

const RulesSection: React.FC<RulesSectionProps> = ({
	rules,
	rulesets,
	category_id,
}) => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);

	const { data } = useArenaCoreQueryExtensionQuery({
		client:
			cosmWasmClient &&
			new ArenaCoreQueryClient(cosmWasmClient, env.ARENA_CORE_ADDRESS),
		args: {
			msg: {
				rulesets: {
					// biome-ignore lint/style/noNonNullAssertion: Checked by options
					category_id: category_id!,
					include_disabled: false,
					limit: rulesets.length,
					start_after: null,
				},
			},
		},
		options: {
			enabled: !!cosmWasmClient && rulesets.length > 0 && !!category_id,
		},
	});

	const rulesetsData = data as unknown as Ruleset[];

	const accordionItems = useMemo(() => {
		const allRules = rulesetsData?.map((ruleset) => ({
			title: `Ruleset ${ruleset.id}`,
			rules: ruleset.rules,
			description: ruleset.description as string | undefined,
		}));

		if (rules.length > 0)
			allRules.push({ title: "Rules", rules: rules, description: undefined });

		return allRules?.map((ruleSet, index) => (
			<AccordionItem
				// biome-ignore lint/suspicious/noArrayIndexKey: best option
				key={index}
				aria-label={ruleSet.title}
				title={ruleSet.title}
				subtitle={ruleSet.description}
			>
				<ul className="list-inside list-disc">
					{ruleSet.rules.map((rule, ruleIndex) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: best option
						<li key={ruleIndex}>{rule}</li>
					))}
				</ul>
			</AccordionItem>
		));
	}, [rules, rulesetsData]);

	return (
		<Accordion
			aria-label="Rules"
			selectionMode="multiple"
			defaultExpandedKeys={["Rules"]}
		>
			{accordionItems}
		</Accordion>
	);
};

export default RulesSection;
