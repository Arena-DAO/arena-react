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
} from "@nextui-org/react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
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
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const { address } = useChain(env.CHAIN);
	const queryClient = useQueryClient();
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

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
		enabled: !!cosmWasmClient,
	});

	const balances = useMemo(
		() => query.data?.pages.flatMap((page) => page.items) ?? [],
		[query.data],
	);

	if (!cosmWasmClient || query.isInitialLoading) {
		return (
			<div className="flex justify-center">
				<Spinner />
			</div>
		);
	}

	return (
		<>
			<Button onPress={onOpen}>View Balances</Button>
			<Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl">
				<ModalContent>
					<ModalHeader>
						<h2 className="font-semibold text-xl">Balances</h2>
					</ModalHeader>
					<ModalBody>
						<Table
							isHeaderSticky
							aria-label="Balances"
							bottomContent={
								query.hasNextPage && (
									<div className="flex w-full justify-center">
										<Button
											onClick={() => query.fetchNextPage()}
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
				</ModalContent>
			</Modal>
		</>
	);
};

export default BalancesModal;
