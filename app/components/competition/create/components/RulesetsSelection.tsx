"use client";

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
import { useInfiniteScroll } from "@nextui-org/use-infinite-scroll";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { useAsyncList } from "react-stately";
import { ArenaCoreQueryClient } from "~/codegen/ArenaCore.client";
import type { Ruleset } from "~/codegen/ArenaCore.types";
import { useCategory } from "~/hooks/useCategory";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import type { CreateCompetitionFormValues } from "../CreateCompetitionForm";

const RulesetsSelection = () => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const { data: category } = useCategory();

	const [hasMore, setHasMore] = useState(false);
	const list = useAsyncList<Ruleset, string | undefined>({
		async load({ cursor }) {
			if (!cosmWasmClient) {
				return { items: [] };
			}
			const client = new ArenaCoreQueryClient(
				cosmWasmClient,
				env.ARENA_CORE_ADDRESS,
			);

			const data = await client.queryExtension({
				msg: {
					rulesets: {
						start_after: cursor,
						category_id: category?.category_id?.toString(),
					},
				},
			});
			const parsedData = data as unknown as Ruleset[];

			setHasMore(parsedData.length === env.PAGINATION_LIMIT);

			return {
				items: parsedData,
				cursor: parsedData[parsedData.length - 1]?.id,
			};
		},
	});
	const [loaderRef, scrollerRef] = useInfiniteScroll({
		hasMore,
		onLoadMore: list.loadMore,
	});
	const { control } = useFormContext<CreateCompetitionFormValues>();
	const { append, remove } = useFieldArray({
		name: "rulesets",
		control,
	});

	return (
		<Table
			isHeaderSticky
			aria-label="Rulesets"
			baseRef={scrollerRef}
			removeWrapper
			isStriped
			hideHeader={list?.items.length === 0}
			bottomContent={
				hasMore ? (
					<div className="flex w-full justify-center">
						<Spinner ref={loaderRef} color="white" />
					</div>
				) : null
			}
			classNames={{
				base: "max-h-xl overflow-auto table-auto",
			}}
		>
			<TableHeader>
				<TableColumn>Rulesets</TableColumn>
				<TableColumn className="text-right">Selection</TableColumn>
			</TableHeader>
			<TableBody
				items={list.items}
				isLoading={list.isLoading}
				loadingContent={<Spinner color="white" />}
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
											// biome-ignore lint/suspicious/noArrayIndexKey: Best option for now
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
										remove(list.items.findIndex((x) => x.id === item.id));
									}
								}}
							/>
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
};

export default RulesetsSelection;
