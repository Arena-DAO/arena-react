"use client";

import { Card, CardBody, CardHeader, Spinner } from "@nextui-org/react";
import { ArenaEscrowQueryClient } from "~/codegen/ArenaEscrow.client";
import { useArenaEscrowDumpStateQuery } from "~/codegen/ArenaEscrow.react-query";
import type { WithClient } from "~/types/util";
import BalanceDisplay from "./BalanceDisplay";

interface EscrowSectionProps {
	escrow: string;
	address?: string;
}

const EscrowSection = ({
	escrow,
	cosmWasmClient,
	address,
}: WithClient<EscrowSectionProps>) => {
	const { data, isLoading } = useArenaEscrowDumpStateQuery({
		client: new ArenaEscrowQueryClient(cosmWasmClient, escrow),
		args: { addr: address },
	});

	if (isLoading || !data) {
		return <Spinner />;
	}
	return (
		<>
			{data.balance && (
				<Card>
					<CardHeader>User Balance</CardHeader>
					<CardBody>
						<BalanceDisplay
							cosmWasmClient={cosmWasmClient}
							balance={data.balance}
						/>
					</CardBody>
				</Card>
			)}
			{data.due && (
				<Card>
					<CardHeader>User Due</CardHeader>
					<CardBody>
						<BalanceDisplay
							cosmWasmClient={cosmWasmClient}
							balance={data.due}
						/>
					</CardBody>
				</Card>
			)}
			{data.total_balance && (
				<Card>
					<CardHeader>Total Balance</CardHeader>
					<CardBody>
						<BalanceDisplay
							cosmWasmClient={cosmWasmClient}
							balance={data.total_balance}
						/>
					</CardBody>
				</Card>
			)}
		</>
	);
};

export default EscrowSection;
