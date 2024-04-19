"use client";

import {
	Badge,
	Button,
	Chip,
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
import { BsHourglassBottom, BsPlus } from "react-icons/bs";
import { useAsyncList } from "react-stately";
import { ArenaWagerModuleQueryClient } from "~/codegen/ArenaWagerModule.client";
import type { CompetitionResponseForEmpty } from "~/codegen/ArenaWagerModule.types";
import { statusColors } from "~/helpers/ArenaHelpers";
import type { CategoryLeaf } from "~/hooks/useCategories";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import type { WithClient } from "~/types/util";

interface CompetitionModuleSectionProps {
	category: CategoryLeaf;
	module_addr: string;
	path: string;
}

const CompetitionModuleSectionItems = ({
	cosmWasmClient,
	category,
	module_addr,
	path,
}: WithClient<CompetitionModuleSectionProps>) => {
	const { data: env } = useEnv();
	const [hasMore, setHasMore] = useState(false);
	const list = useAsyncList<CompetitionResponseForEmpty, string | undefined>({
		async load({ cursor }) {
			const client = new ArenaWagerModuleQueryClient(
				cosmWasmClient,
				module_addr,
			);

			const data = await client.competitions({
				startAfter: cursor,
				filter: { category: { id: category.category_id?.toString() } },
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
				<TableColumn>Status</TableColumn>
				<TableColumn>Description</TableColumn>
				<TableColumn>Actions</TableColumn>
			</TableHeader>
			<TableBody
				emptyContent="No competitions yet.. Create one!"
				items={list.items}
				isLoading={list.isLoading}
				loadingContent={<Spinner color="white" />}
			>
				{(item: CompetitionResponseForEmpty) => (
					<TableRow key={item.id}>
						<TableCell>{item.name}</TableCell>
						<TableCell>
							<Badge
								isOneChar
								content={<BsHourglassBottom />}
								color="warning"
								aria-label="Expired"
								isInvisible={
									!(
										item.is_expired &&
										(item.status === "active" || item.status === "pending")
									)
								}
							>
								<Chip color={statusColors[item.status]}>{item.status}</Chip>
							</Badge>
						</TableCell>
						<TableCell>{item.description}</TableCell>
						<TableCell>
							<Button
								as={Link}
								href={`/${path}/view?category=${category.url}&competitionId=${item.id}`}
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

	return (
		<div className="space-y-4">
			<div className="block text-right">
				<Button
					startContent={<BsPlus />}
					as={Link}
					href={`/${props.path}/create?category=${props.category.url}`}
				>
					Create
				</Button>
			</div>
			{cosmWasmClient && (
				<CompetitionModuleSectionItems
					cosmWasmClient={cosmWasmClient}
					{...props}
				/>
			)}
		</div>
	);
};

export default CompetitionModuleSection;
