"use client";

import Profile from "@/components/Profile";
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
import { useInfiniteQuery } from "@tanstack/react-query";
import { ArenaEscrowQueryClient } from "~/codegen/ArenaEscrow.client";
import { arenaEscrowQueryKeys } from "~/codegen/ArenaEscrow.react-query";
import type { MemberBalanceChecked } from "~/codegen/ArenaEscrow.types";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import BalanceDisplay from "./BalanceDisplay";

interface InitialDuesModalProps {
	escrow: string;
}

const InitialDuesModal = ({ escrow }: InitialDuesModalProps) => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	const fetchInitialDues = async ({ pageParam = undefined }) => {
		if (!cosmWasmClient) {
			throw new Error("CosmWasm client not available");
		}

		const client = new ArenaEscrowQueryClient(cosmWasmClient, escrow);
		const data = await client.initialDues({ startAfter: pageParam });

		return {
			items: data,
			nextCursor:
				data.length === env.PAGINATION_LIMIT
					? data[data.length - 1]?.addr
					: undefined,
		};
	};

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
		useInfiniteQuery({
			queryKey: arenaEscrowQueryKeys.initialDues(escrow),
			queryFn: fetchInitialDues,
			getNextPageParam: (lastPage) => lastPage.nextCursor,
			enabled: !!cosmWasmClient,
		});

	const allDues = data?.pages.flatMap((page) => page.items) ?? [];

	return (
		<>
			<Button onPress={onOpen}>View Initial Dues</Button>
			<Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl">
				<ModalContent>
					<ModalHeader className="flex flex-col gap-1">
						Initial Dues
					</ModalHeader>
					<ModalBody>
						<Table
							isHeaderSticky
							aria-label="Dues"
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
								base: "max-h-xl overflow-auto table-auto",
							}}
						>
							<TableHeader>
								<TableColumn>Team</TableColumn>
								<TableColumn>Due</TableColumn>
							</TableHeader>
							<TableBody
								emptyContent="No dues available"
								items={allDues}
								isLoading={isLoading}
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

export default InitialDuesModal;
