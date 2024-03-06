"use client";

import {
	Button,
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
import { Ruleset } from "~/codegen/ArenaCore.types";
import { useEnv } from "~/hooks/useEnv";
import { WithClient } from "~/types/util";
import { CreateCompetitionFormValues } from "../CreateCompetitionForm";

interface RulesetsSelectionProps {
	category_id?: number | null;
}

const RulesetsSelection = ({
	cosmWasmClient,
	category_id,
}: WithClient<RulesetsSelectionProps>) => {
	const { data: env } = useEnv();
	const [hasMore, setHasMore] = useState(false);
	const list = useAsyncList<Ruleset, string | undefined>({
		async load({ cursor }) {
			const client = new ArenaCoreQueryClient(
				cosmWasmClient,
				env.ARENA_CORE_ADDRESS,
			);

			const data = await client.queryExtension({
				msg: {
					rulesets: {
						start_after: cursor,
						category_id: category_id?.toString(),
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
			bottomContent={
				hasMore ? (
					<div className="flex w-full justify-center">
						<Spinner ref={loaderRef} color="white" />
					</div>
				) : null
			}
			classNames={{
				base: "max-h-[520px] overflow-auto table-auto",
			}}
		>
			<TableHeader>
				<TableColumn>Rulesets</TableColumn>
				<TableColumn>Actions</TableColumn>
			</TableHeader>
			<TableBody
				emptyContent="No rulesets available"
				items={list.items}
				isLoading={list.isLoading}
				loadingContent={<Spinner color="white" />}
			>
				{(item: Ruleset) => (
					<TableRow key={item.id}>
						<TableCell>{item.description}</TableCell>
						<TableCell className="space-x-4">
							<Button>View</Button>
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
