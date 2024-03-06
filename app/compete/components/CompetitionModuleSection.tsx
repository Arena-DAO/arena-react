"use client";

import {
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
import { BsPlus } from "react-icons/bs";
import { useAsyncList } from "react-stately";
import { ArenaWagerModuleQueryClient } from "~/codegen/ArenaWagerModule.client";
import { CompetitionResponseForEmpty } from "~/codegen/ArenaWagerModule.types";
import { statusColors } from "~/helpers/ArenaHelpers";
import { CategoryLeaf } from "~/hooks/useCategories";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import { WithClient } from "~/types/util";

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
				base: "max-h-[600px] overflow-auto table-auto",
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
							<Chip color={statusColors[item.status]}>{item.status}</Chip>
						</TableCell>
						<TableCell>{item.description}</TableCell>
						<TableCell>
							<Link href={`/${path}/view?category=${category}&id=${item.id}`}>
								<Button>View</Button>
							</Link>
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
				<Link href={`/${props.path}/create?category=${props.category.url}`}>
					<Button startContent={<BsPlus />}>Create</Button>
				</Link>
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
