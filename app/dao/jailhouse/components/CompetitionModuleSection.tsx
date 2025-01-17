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
} from "@heroui/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ArenaWagerModuleQueryClient } from "~/codegen/ArenaWagerModule.client";
import { arenaWagerModuleQueryKeys } from "~/codegen/ArenaWagerModule.react-query";
import type { CompetitionResponseForWagerExt } from "~/codegen/ArenaWagerModule.types";
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
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();

	const fetchCompetitions = async ({ pageParam = undefined }) => {
		if (!cosmWasmClient) {
			throw new Error("CosmWasm client not available");
		}

		const client = new ArenaWagerModuleQueryClient(cosmWasmClient, module_addr);

		const data = await client.competitions({
			startAfter: pageParam,
			filter: {
				competition_status: { status: { jailed: { activation_height: 0 } } },
			},
		});

		return {
			items: data,
			nextCursor:
				data.length === env.PAGINATION_LIMIT
					? data[data.length - 1]?.id
					: undefined,
		};
	};

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
		useInfiniteQuery({
			queryKey: arenaWagerModuleQueryKeys.competitions(module_addr, {
				filter: {
					competition_status: { status: { jailed: { activation_height: 0 } } },
				},
			}),
			queryFn: fetchCompetitions,
			getNextPageParam: (lastPage) => lastPage.nextCursor,
			enabled: !!cosmWasmClient,
		});

	const allCompetitions = data?.pages.flatMap((page) => page.items) ?? [];

	return (
		<Table
			isHeaderSticky
			aria-label="Competitions"
			bottomContent={
				hasNextPage && (
					<div className="flex w-full justify-center">
						<Button
							isLoading={isFetchingNextPage}
							onPress={() => fetchNextPage()}
						>
							Load More
						</Button>
					</div>
				)
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
			<TableBody
				emptyContent="No jailed competitions yet"
				items={allCompetitions}
				isLoading={isLoading}
				loadingContent={<Spinner color="white" />}
			>
				{(item: CompetitionResponse) => (
					<TableRow key={item.id}>
						<TableCell>{item.name}</TableCell>
						<TableCell>{item.description}</TableCell>
						<TableCell>
							<Button as={Link} href={`/${path}/view?competitionId=${item.id}`}>
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
