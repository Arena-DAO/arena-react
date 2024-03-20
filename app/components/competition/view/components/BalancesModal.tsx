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
import { useEffect, useState } from "react";
import { useAsyncList } from "react-stately";
import { ArenaEscrowQueryClient } from "~/codegen/ArenaEscrow.client";
import type { MemberBalanceChecked } from "~/codegen/ArenaEscrow.types";
import { useEnv } from "~/hooks/useEnv";
import type { WithClient } from "~/types/util";
import BalanceDisplay from "./BalanceDisplay";

interface BalancesModalProps {
	escrow: string;
	version: number;
}

const BalancesModal = ({
	escrow,
	version,
	cosmWasmClient,
}: WithClient<BalancesModalProps>) => {
	const { data: env } = useEnv();
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const [hasMore, setHasMore] = useState(false);
	const list = useAsyncList<MemberBalanceChecked, string | undefined>({
		async load({ cursor }) {
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
	// biome-ignore lint/correctness/useExhaustiveDependencies: Stops cycle
	useEffect(() => {
		if (version > 0) {
			list.reload();
		}
	}, [version]);

	return (
		<span>
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
								base: "max-h-[520px] overflow-auto table-auto",
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
											<Profile
												address={item.addr}
												cosmWasmClient={cosmWasmClient}
											/>
										</TableCell>
										<TableCell>
											<BalanceDisplay
												balance={item.balance}
												cosmWasmClient={cosmWasmClient}
											/>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</ModalBody>
				</ModalContent>
			</Modal>
		</span>
	);
};

export default BalancesModal;
