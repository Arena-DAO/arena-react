"use client";

import Profile from "@/components/Profile";
import { useChain } from "@cosmos-kit/react";
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

interface BalancesModalProps {
	escrow: string;
}

const BalancesModal = ({ escrow }: BalancesModalProps) => {
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const { address } = useChain(env.CHAIN);
	const queryClient = useQueryClient();
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const targetRef = React.useRef(null);
	const { moveProps } = useDraggable({ targetRef, isDisabled: !isOpen });

	const fetchBalances = async ({ pageParam = undefined }) => {
		if (!cosmWasmClient) {
			throw new Error("Could not get CosmWasm client");
		}

		const client = new ArenaEscrowQueryClient(cosmWasmClient, escrow);
		const data = await client.balances({ startAfter: pageParam });

		const userBalance = data.find((x) => x.addr === address);
		if (userBalance) {
			queryClient.setQueryData(
				arenaEscrowQueryKeys.balance(escrow, { addr: address }),
				() => userBalance,
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
		queryKey: arenaEscrowQueryKeys.balances(escrow),
		queryFn: fetchBalances,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		enabled: !!cosmWasmClient && isOpen,
	});

	const balances = useMemo(
		() => query.data?.pages.flatMap((page) => page.items) ?? [],
		[query.data],
	);

	return (
		<>
			<Button onPress={onOpen}>View Balances</Button>
			<Modal
				ref={targetRef}
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				size="5xl"
			>
				<ModalContent>
					<ModalHeader {...moveProps}>
						<h2 className="font-semibold text-xl">Balances</h2>
					</ModalHeader>
					<ModalBody>
						<Table
							isHeaderSticky
							aria-label="Balances"
							classNames={{
								base: "max-h-xl overflow-auto table-auto",
							}}
						>
							<TableHeader>
								<TableColumn>Team</TableColumn>
								<TableColumn>Balance</TableColumn>
							</TableHeader>
							<TableBody
								emptyContent="No balances available"
								items={balances}
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
					{query.hasNextPage && (
						<ModalFooter>
							<Button
								onPress={() => query.fetchNextPage()}
								isLoading={query.isFetchingNextPage}
							>
								Load More
							</Button>
						</ModalFooter>
					)}
				</ModalContent>
			</Modal>
		</>
	);
};

export default BalancesModal;
