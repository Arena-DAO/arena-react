"use client";

import Profile from "@/components/Profile";
import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Spinner,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	getKeyValue,
	useDisclosure,
	useDraggable,
} from "@nextui-org/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import { useMemo } from "react";
import { ArenaWagerModuleQueryClient } from "~/codegen/ArenaWagerModule.client";
import { arenaWagerModuleQueryKeys } from "~/codegen/ArenaWagerModule.react-query";
import type { StatMsg, StatTableEntry } from "~/codegen/ArenaWagerModule.types";
import { renderStatValue } from "~/helpers/ArenaHelpers";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

interface StatsTableProps {
	moduleAddr: string;
	competitionId: string;
}

const StatsTable: React.FC<StatsTableProps> = ({
	moduleAddr,
	competitionId,
}) => {
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useInfiniteQuery({
			queryKey: arenaWagerModuleQueryKeys.statsTable(moduleAddr, {
				competitionId,
			}),
			queryFn: async ({ pageParam = undefined }) => {
				if (!cosmWasmClient) throw new Error("CosmWasm client not available");
				const client = new ArenaWagerModuleQueryClient(
					cosmWasmClient,
					moduleAddr,
				);
				return await client.statsTable({
					competitionId,
					limit: env.PAGINATION_LIMIT,
					startAfter: pageParam,
				});
			},
			getNextPageParam: (lastPage) => {
				if (lastPage.length === 0 || lastPage.length < env.PAGINATION_LIMIT)
					return undefined;
				return lastPage[lastPage.length - 1]?.addr;
			},
			enabled: !!cosmWasmClient && isOpen,
			retry: false,
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			refetchOnMount: false,
		});

	const { rows, columns } = useMemo(() => {
		if (!data || data.pages.length === 0 || !data.pages[0] || !data.pages[0][0])
			return { rows: [], columns: [{ key: "addr", label: "MEMBER" }] };

		const columns = [
			{ key: "addr", label: "MEMBER" },
			...data.pages[0][0].stats.map((stat: StatMsg) => ({
				key: stat.name,
				label: stat.name.toUpperCase(),
			})),
		];

		const rows = data.pages.flatMap((page, pageIndex) =>
			page.map((entry: StatTableEntry, entryIndex: number) => {
				const row: Record<string, string> = {
					key: `${pageIndex}-${entryIndex}`,
					addr: entry.addr,
				};
				for (const stat of entry.stats) {
					row[stat.name] = renderStatValue(stat.value);
				}
				return row;
			}),
		);

		return { rows, columns };
	}, [data]);
	const targetRef = React.useRef(null);
	const { moveProps } = useDraggable({ targetRef, isDisabled: !isOpen });

	return (
		<>
			<Button onPress={onOpen}>Stats</Button>
			<Modal
				ref={targetRef}
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				size="xl"
			>
				<ModalContent>
					<ModalHeader {...moveProps}>
						<h2>Members</h2>
					</ModalHeader>
					<ModalBody>
						<Table aria-label="Competition Stats Table" removeWrapper>
							<TableHeader columns={columns}>
								{(column) => (
									<TableColumn key={column.key}>{column.label}</TableColumn>
								)}
							</TableHeader>
							<TableBody
								items={rows}
								emptyContent="No stats recorded for the competition yet"
								isLoading={isLoading}
								loadingContent={<Spinner content="Loading stats..." />}
							>
								{(item) => (
									<TableRow key={item.key}>
										{(columnKey) => (
											<TableCell>
												{columnKey === "addr" ? (
													<Profile
														address={getKeyValue(item, columnKey)}
														statProps={{ moduleAddr, competitionId }}
													/>
												) : (
													getKeyValue(item, columnKey)
												)}
											</TableCell>
										)}
									</TableRow>
								)}
							</TableBody>
						</Table>
					</ModalBody>
					{hasNextPage && (
						<ModalFooter>
							<Button
								onPress={() => fetchNextPage()}
								isLoading={isFetchingNextPage}
								disabled={!hasNextPage || isFetchingNextPage}
							>
								{isFetchingNextPage ? "Loading more..." : "Load More"}
							</Button>
						</ModalFooter>
					)}
				</ModalContent>
			</Modal>
		</>
	);
};

export default StatsTable;
