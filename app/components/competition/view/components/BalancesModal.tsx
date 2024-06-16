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
import { useInfiniteScroll } from "@nextui-org/use-infinite-scroll";
import { useState } from "react";
import { useAsyncList } from "react-stately";
import { ArenaEscrowQueryClient } from "~/codegen/ArenaEscrow.client";
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
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const [hasMore, setHasMore] = useState(false);
	const list = useAsyncList<MemberBalanceChecked, string | undefined>({
		async load({ cursor }) {
			if (!cosmWasmClient) {
				return { items: [] };
			}

			const client = new ArenaEscrowQueryClient(cosmWasmClient, escrow);

			const data = await client.balances({ startAfter: cursor });

			setHasMore(data.length === env.PAGINATION_LIMIT);

			return {
				items: data,
				cursor: data[data.length - 1]?.addr,
			};
		},
	});
	const [loaderRef, scrollerRef] = useInfiniteScroll({
		hasMore,
		onLoadMore: list.loadMore,
	});

	return (
		<>
			<Button onPress={onOpen}>View Balances</Button>
			<Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl">
				<ModalContent>
					<ModalHeader className="flex flex-col gap-1">Balances</ModalHeader>
					<ModalBody>
						<Table
							isHeaderSticky
							aria-label="Balances"
							baseRef={scrollerRef}
							bottomContent={
								hasMore ? (
									<div className="flex w-full justify-center">
										<Spinner ref={loaderRef} color="white" />
									</div>
								) : null
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
								items={list.items}
								isLoading={list.isLoading}
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
