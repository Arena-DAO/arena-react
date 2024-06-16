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
import type { CompetitionResponseForWagerExt } from "~/codegen/ArenaWagerModule.types";
import { useCategoryMap } from "~/hooks/useCategories";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

type CompetitionResponse = Omit<CompetitionResponseForWagerExt, "extension">;

interface CompetitionModuleSectionProps {
	module_addr: string;
	path: string;
}

const CompetitionModuleSection = ({
	module_addr,
	path,
}: CompetitionModuleSectionProps) => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const [hasMore, setHasMore] = useState(true);
	const { data: categoryMap } = useCategoryMap("id");
	const list = useAsyncList<CompetitionResponse, string | undefined>({
		async load({ cursor }) {
			if (!cosmWasmClient) {
				return { items: [] };
			}

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
				base: "max-h-2xl overflow-auto table-auto",
			}}
		>
			<TableHeader>
				<TableColumn>Name</TableColumn>
				<TableColumn>Description</TableColumn>
				<TableColumn>Actions</TableColumn>
			</TableHeader>
			{/*<TableBody
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
			</TableBody>*/}
			<TableBody
				emptyContent="No jailed competitions yet"
				items={list.items}
				isLoading={list.isLoading}
				loadingContent={<Spinner color="white" />}
			>
				{(item: CompetitionResponse) => (
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

export default CompetitionModuleSection;
