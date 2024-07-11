import MaybeLink from "@/components/MaybeLink";
import { Accordion, AccordionItem } from "@nextui-org/react";
import type React from "react";
import { useMemo } from "react";
import { ArenaCoreQueryClient } from "~/codegen/ArenaCore.client";
import { useArenaCoreQueryExtensionQuery } from "~/codegen/ArenaCore.react-query";
import type { Ruleset } from "~/codegen/ArenaCore.types";
import { useCategoryContext } from "~/contexts/CategoryContext";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

interface RulesSectionProps {
	rules?: string[] | null;
	rulesets?: string[] | null;
}

const RulesDisplay: React.FC<RulesSectionProps> = ({ rules, rulesets }) => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const category = useCategoryContext();

	const { data } = useArenaCoreQueryExtensionQuery({
		client:
			cosmWasmClient &&
			new ArenaCoreQueryClient(cosmWasmClient, env.ARENA_CORE_ADDRESS),
		args: {
			msg: {
				rulesets: {
					category_id: category?.category_id?.toString() || "",
					include_disabled: false,
					start_after: null,
				},
			},
		},
		options: {
			enabled:
				!!cosmWasmClient && !!rulesets && rulesets.length > 0 && !!category,
		},
	});

	const rulesetsData = data as unknown as Ruleset[];

	const accordionItems = useMemo(() => {
		const allRules =
			rulesetsData?.map((ruleset) => ({
				title: `Ruleset ${ruleset.id}`,
				rules: ruleset.rules,
				description: ruleset.description as string | undefined,
			})) ?? [];

		if (rules && rules.length > 0) {
			allRules.push({ title: "Rules", rules: rules, description: undefined });
		}

		return allRules?.map((ruleSet, index) => (
			<AccordionItem
				// biome-ignore lint/suspicious/noArrayIndexKey: best option
				key={index}
				aria-label={ruleSet.title}
				title={ruleSet.title}
				subtitle={ruleSet.description}
				classNames={{ title: "text-medium", content: "gap-2" }}
			>
				<ul className="list-inside list-disc">
					{ruleSet.rules.map((rule, ruleIndex) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: best option
						<li key={ruleIndex}>
							<MaybeLink content={rule} />
						</li>
					))}
				</ul>
			</AccordionItem>
		));
	}, [rules, rulesetsData]);

	return (
		<Accordion aria-label="Rules" selectionMode="multiple">
			{accordionItems}
		</Accordion>
	);
};

export default RulesDisplay;
