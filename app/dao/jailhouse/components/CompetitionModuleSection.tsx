"use client";

import {
	Button,
	Link,
	Spinner,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@nextui-org/react";
import { useInfiniteScroll } from "@nextui-org/use-infinite-scroll";
import { useState } from "react";
import { useAsyncList } from "react-stately";
import { ArenaWagerModuleQueryClient } from "~/codegen/ArenaWagerModule.client";
import type { CompetitionResponseForEmpty } from "~/codegen/ArenaWagerModule.types";
import { useCategoryMap } from "~/hooks/useCategories";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import type { WithClient } from "~/types/util";

interface CompetitionModuleSectionProps {
	module_addr: string;
	path: string;
}

const CompetitionModuleSectionItems = ({
	cosmWasmClient,
	module_addr,
	path,
}: WithClient<CompetitionModuleSectionProps>) => {
	const { data: env } = useEnv();
	const [hasMore, setHasMore] = useState(false);
	const { data: categoryMap } = useCategoryMap("id");
	const list = useAsyncList<CompetitionResponseForEmpty, string | undefined>({
		async load({ cursor }) {
			const client = new ArenaWagerModuleQueryClient(
				cosmWasmClient,
				module_addr,
			);

			const data = await client.competitions({
				startAfter: cursor,
				filter: { competition_status: { status: "jailed" } },
			});

			setHasMore(data.length === env.PAGINATION_LIMIT);

			return {
				items: data,
				cursor: data[data.length - 1]?.id,
			};
		},
	});
	const [loaderRef, scrollerRef] = useInfiniteScroll({
		hasMore,
		onLoadMore: list.loadMore,
	});

	return (
		<Table
			isHeaderSticky
			aria-label="Competitions"
			baseRef={scrollerRef}
			bottomContent={
				hasMore ? (
					<div className="flex w-full justify-center">
						<Spinner ref={loaderRef} color="white" />
					</div>
				) : null
			}
			classNames={{
				base: "max-h-[600px] overflow-auto table-auto",
			}}
		>
			<TableHeader>
				<TableColumn>Name</TableColumn>
				<TableColumn>Description</TableColumn>
				<TableColumn>Actions</TableColumn>
			</TableHeader>
			<TableBody
				emptyContent="No jailed competitions yet"
				items={list.items}
				isLoading={list.isLoading}
				loadingContent={<Spinner color="white" />}
			>
				{(item: CompetitionResponseForEmpty) => (
					<TableRow key={item.id}>
						<TableCell>{item.name}</TableCell>
						<TableCell>{item.description}</TableCell>
						<TableCell>
							<Button
								as={Link}
								href={`/${path}/view?category=${
									categoryMap.get(item.category_id ?? "")?.url
								}&competitionId=${item.id}`}
							>
								View
							</Button>
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
};

const CompetitionModuleSection = (props: CompetitionModuleSectionProps) => {
	const { data: cosmWasmClient } = useCosmWasmClient();

	if (!cosmWasmClient) return null;
	return (
		<CompetitionModuleSectionItems cosmWasmClient={cosmWasmClient} {...props} />
	);
};

export default CompetitionModuleSection;
