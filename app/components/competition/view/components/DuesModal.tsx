"use client";

import Profile from "@/components/Profile";
import { useChain } from "@cosmos-kit/react";
import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalHeader,
	Spinner,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	useDisclosure,
	useDraggable,
} from "@heroui/react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import React from "react";
import { ArenaEscrowQueryClient } from "~/codegen/ArenaEscrow.client";
import { arenaEscrowQueryKeys } from "~/codegen/ArenaEscrow.react-query";
import type { MemberBalanceChecked } from "~/codegen/ArenaEscrow.types";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import BalanceDisplay from "./BalanceDisplay";

interface DuesModalProps {
	escrow: string;
}

const DuesModal = ({ escrow }: DuesModalProps) => {
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const { address } = useChain(env.CHAIN);
	const queryClient = useQueryClient();
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	const fetchDues = async ({ pageParam = undefined }) => {
		if (!cosmWasmClient) {
			throw new Error("Could not get CosmWasm client");
		}

		const client = new ArenaEscrowQueryClient(cosmWasmClient, escrow);
		const data = await client.dues({ startAfter: pageParam });

		const userDue = data.find((x) => x.addr === address);
		if (userDue) {
			queryClient.setQueryData(
				arenaEscrowQueryKeys.due(escrow, { addr: address }),
				() => userDue,
			);
		}

		return {
			items: data,
			nextCursor:
				data.length === env.PAGINATION_LIMIT
					? data[data.length - 1]?.addr
					: undefined,
		};
	};

	const query = useInfiniteQuery({
		queryKey: arenaEscrowQueryKeys.dues(escrow),
		queryFn: fetchDues,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		enabled: !!cosmWasmClient && isOpen,
	});

	const dues = useMemo(
		() => query.data?.pages.flatMap((page) => page.items) ?? [],
		[query.data],
	);
	// biome-ignore lint/style/noNonNullAssertion: correct
	const targetRef = React.useRef(null!);
	const { moveProps } = useDraggable({ targetRef, isDisabled: !isOpen });

	if (!cosmWasmClient) {
		return (
			<div className="flex justify-center">
				<Spinner />
			</div>
		);
	}

	return (
		<>
			<Button onPress={onOpen}>View Dues</Button>
			<Modal
				ref={targetRef}
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				size="5xl"
			>
				<ModalContent>
					<ModalHeader {...moveProps} className="flex flex-col gap-1">
						Dues
					</ModalHeader>
					<ModalBody>
						<Table
							isHeaderSticky
							aria-label="Dues"
							bottomContent={
								query.hasNextPage && (
									<div className="flex w-full justify-center">
										<Button
											onPress={() => query.fetchNextPage()}
											isLoading={query.isFetchingNextPage}
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
								<TableColumn>Team</TableColumn>
								<TableColumn>Due</TableColumn>
							</TableHeader>
							<TableBody
								emptyContent="No dues available"
								items={dues}
								isLoading={query.isLoading}
								loadingContent={<Spinner color="white" />}
							>
								{(item: MemberBalanceChecked) => (
									<TableRow key={item.addr}>
										<TableCell>
											<Profile address={item.addr} />
										</TableCell>
										<TableCell>
											<BalanceDisplay balance={item.balance} />
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	);
};

export default DuesModal;
