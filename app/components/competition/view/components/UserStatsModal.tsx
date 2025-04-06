"use client";

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
import React from "react";
import { useMemo } from "react";
import { ArenaWagerModuleQueryClient } from "~/codegen/ArenaWagerModule.client";
import { useArenaWagerModuleHistoricalStatsQuery } from "~/codegen/ArenaWagerModule.react-query";
import { renderStatValue } from "~/helpers/ArenaHelpers";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

interface UserStatsModalProps {
	moduleAddr: string;
	competitionId: string;
	userAddress: string;
}

const UserStatsModal: React.FC<UserStatsModalProps> = ({
	moduleAddr,
	competitionId,
	userAddress,
}) => {
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();

	const { data, isLoading } = useArenaWagerModuleHistoricalStatsQuery({
		client:
			cosmWasmClient &&
			new ArenaWagerModuleQueryClient(cosmWasmClient, moduleAddr),
		args: { addr: userAddress, competitionId },
		options: {
			enabled: isOpen && !!cosmWasmClient,
			retry: false,
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			refetchOnMount: false,
		},
	});

	const { rows, columns } = useMemo(() => {
		if (!data || data.length === 0)
			return { rows: [], columns: [{ key: "name", label: "STAT" }] };

		const allStats = data.flat();
		const uniqueStatNames = Array.from(
			new Set(allStats.map((stat) => stat.name)),
		);

		const columns = [
			{ key: "blockHeight", label: "BLOCK HEIGHT" },
			...uniqueStatNames.map((name) => ({
				key: name,
				label: name.toUpperCase(),
			})),
		];

		const rows = data.map((statGroup, index) => {
			const row: Record<string, string | undefined> = {
				key: index.toString(),
				blockHeight:
					statGroup[0] && "height" in statGroup[0] && statGroup[0].height
						? statGroup[0].height.toString()
						: "-",
			};
			for (const stat of statGroup) {
				row[stat.name] = renderStatValue(stat.value);
			}
			return row;
		});

		return { rows, columns };
	}, [data]);

	// biome-ignore lint/style/noNonNullAssertion: correct
	const targetRef = React.useRef(null!);
	const { moveProps } = useDraggable({ targetRef, isDisabled: !isOpen });

	return (
		<>
			<Button onPress={onOpen}>View Historical Stats</Button>
			<Modal
				ref={targetRef}
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				size="2xl"
			>
				<ModalContent>
					<ModalHeader {...moveProps}>
						<h2 className="font-semibold text-xl">User Historical Stats</h2>
					</ModalHeader>
					<ModalBody>
						<Table aria-label="User Historical Stats Table" removeWrapper>
							<TableHeader columns={columns}>
								{(column) => (
									<TableColumn key={column.key}>{column.label}</TableColumn>
								)}
							</TableHeader>
							<TableBody
								items={rows}
								isLoading={isLoading}
								loadingContent={<Spinner content="Loading user stats..." />}
								emptyContent="No historical stats recorded for this user."
							>
								{(item) => (
									<TableRow key={item.key}>
										{(columnKey) => <TableCell>{item[columnKey]}</TableCell>}
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

export default UserStatsModal;
