import {
	Button,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Spinner,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@nextui-org/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ArenaCoreQueryClient } from "~/codegen/ArenaCore.client";
import type { Ruleset } from "~/codegen/ArenaCore.types";
import type { CreateCompetitionFormValues } from "~/config/schemas/CreateCompetitionSchema";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

interface RulesetsSelectionProps {
	category_id: string;
}

const RulesetsSelection: React.FC<RulesetsSelectionProps> = ({
	category_id,
}) => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const { control } = useFormContext<CreateCompetitionFormValues>();
	const { append, remove } = useFieldArray({
		name: "rulesets",
		control,
	});

	const fetchRulesets = async ({ pageParam = undefined }) => {
		if (!cosmWasmClient || !category_id) {
			return { rulesets: [], nextCursor: undefined };
		}
		const client = new ArenaCoreQueryClient(
			cosmWasmClient,
			env.ARENA_CORE_ADDRESS,
		);

		const data = await client.queryExtension({
			msg: {
				rulesets: {
					start_after: pageParam,
					category_id,
					limit: env.PAGINATION_LIMIT,
				},
			},
		});
		const parsedData = data as unknown as Ruleset[];

		return {
			rulesets: parsedData,
			nextCursor:
				parsedData.length === env.PAGINATION_LIMIT
					? parsedData[parsedData.length - 1]?.id
					: undefined,
		};
	};

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
		useInfiniteQuery({
			queryKey: ["rulesets", category_id],
			queryFn: fetchRulesets,
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		});

	const rulesets = data?.pages.flatMap((page) => page.rulesets) ?? [];

	return (
		<div className="space-y-2">
			<Table
				isHeaderSticky
				aria-label="Rulesets"
				removeWrapper
				isStriped
				hideHeader={rulesets.length === 0}
				bottomContent={
					hasNextPage && (
						<div className="flex justify-center">
							<Button
								isLoading={isFetchingNextPage}
								onClick={() => fetchNextPage()}
							>
								Load More
							</Button>
						</div>
					)
				}
				classNames={{
					base: "max-h-xl overflow-auto table-auto",
				}}
			>
				<TableHeader>
					<TableColumn>Ruleset</TableColumn>
					<TableColumn className="text-right">Selection</TableColumn>
				</TableHeader>
				<TableBody
					items={rulesets}
					isLoading={status === "loading"}
					loadingContent={<Spinner color="white" />}
					emptyContent={"No rulesets available"}
				>
					{(item: Ruleset) => (
						<TableRow key={item.id}>
							<TableCell>{item.description}</TableCell>
							<TableCell className="gap-4 text-right">
								<Popover placement="left">
									<PopoverTrigger>
										<Button>View</Button>
									</PopoverTrigger>
									<PopoverContent>
										<ul className="list-inside list-disc">
											{item.rules.map((rule, i) => (
												// biome-ignore lint/suspicious/noArrayIndexKey: best
												<li key={i}>{rule}</li>
											))}
										</ul>
									</PopoverContent>
								</Popover>
								<Switch
									aria-label="Selected"
									onValueChange={(isSelected) => {
										if (isSelected) {
											append({ ruleset_id: BigInt(item.id) });
										} else {
											remove(rulesets.findIndex((x) => x.id === item.id));
										}
									}}
								/>
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
};

export default RulesetsSelection;
