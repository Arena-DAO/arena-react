"use client";

import type { ExecuteInstruction } from "@cosmjs/cosmwasm-stargate";
import { useChain } from "@cosmos-kit/react";
import {
	Button,
	ButtonGroup,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Spinner,
} from "@nextui-org/react";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
	ArenaEscrowClient,
	ArenaEscrowQueryClient,
} from "~/codegen/ArenaEscrow.client";
import { useArenaEscrowDumpStateQuery } from "~/codegen/ArenaEscrow.react-query";
import type { ExecuteMsg as EscrowExecuteMsg } from "~/codegen/ArenaEscrow.types";
import type { CompetitionStatus } from "~/codegen/ArenaWagerModule.types";
import type { ExecuteMsg as Cw20ExecuteMsg } from "~/codegen/Cw20Base.types";
import { useEnv } from "~/hooks/useEnv";
import type { WithClient } from "~/types/util";
import BalanceDisplay from "./BalanceDisplay";
import BalancesModal from "./BalancesModal";
import DuesModal from "./DuesModal";

interface EscrowSectionProps {
	escrow: string;
	address?: string;
	setCompetitionStatus: Dispatch<SetStateAction<CompetitionStatus>>;
}

const EscrowSection = ({
	escrow,
	cosmWasmClient,
	address,
	setCompetitionStatus,
}: WithClient<EscrowSectionProps>) => {
	const { data: env } = useEnv();
	const { getSigningCosmWasmClient } = useChain(env.CHAIN);
	const { data, isLoading, refetch } = useArenaEscrowDumpStateQuery({
		client: new ArenaEscrowQueryClient(cosmWasmClient, escrow),
		args: { addr: address },
	});
	const [version, setVersion] = useState(0);
	const [isLocked, setIsLocked] = useState(true);
	useEffect(() => {
		if (version > 0) {
			refetch();
		}
	}, [version, refetch]);
	useEffect(() => {
		if (data) {
			setIsLocked(data.is_locked);
		}
	}, [data]);

	const deposit = async () => {
		try {
			if (!address) throw "User's address was not provided";
			if (!data || !data.due) throw "User has none due";

			const client = await getSigningCosmWasmClient();

			const msgs: ExecuteInstruction[] = [];

			if (data.due.native.length > 0) {
				msgs.push({
					contractAddress: escrow,
					msg: { receive_native: {} } as EscrowExecuteMsg,
					funds: data.due.native,
				});
			}
			if (data.due.cw20.length > 0) {
				msgs.push(
					...data.due.cw20.map((x) => {
						return {
							contractAddress: x.address,
							msg: {
								send: { amount: x.amount, contract: escrow, msg: "" },
							} as Cw20ExecuteMsg,
						};
					}),
				);
			}

			const response = await client.executeMultiple(address, msgs, "auto");

			// Check if the response contains the activate action, so we can mark the competition as active
			if (
				response.events.find((event) =>
					event.attributes.find(
						(attr) => attr.key === "action" && attr.value === "activate",
					),
				)
			) {
				setIsLocked(true);
				setCompetitionStatus("active");
				toast.success("The competition is now active");
			}

			toast.success("Funds have been sucessfully deposited");
			setVersion((x) => x + 1);
			// biome-ignore lint/suspicious/noExplicitAny: try-catch
		} catch (e: any) {
			console.error(e);
			toast.error(e.toString());
		}
	};

	const withdraw = async () => {
		try {
			if (!address) throw "User's address was not provided";

			const client = await getSigningCosmWasmClient();

			const escrowClient = new ArenaEscrowClient(client, address, escrow);

			await escrowClient.withdraw({});

			toast.success("Funds have been successfully withdrawn");
			setVersion((x) => x + 1);
			// biome-ignore lint/suspicious/noExplicitAny: try-catch
		} catch (e: any) {
			console.error(e);
			toast.error(e.toString());
		}
	};

	if (isLoading || !data) {
		return (
			<div className="flex justify-center">
				<Spinner />
			</div>
		);
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
					{!isLocked && (
						<CardFooter>
							<Button color="primary" onClick={withdraw}>
								Withdraw
							</Button>
						</CardFooter>
					)}
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
					{!isLocked && (
						<CardFooter>
							<Button color="primary" onClick={deposit}>
								Deposit
							</Button>
						</CardFooter>
					)}
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
			<ButtonGroup>
				<DuesModal
					escrow={escrow}
					cosmWasmClient={cosmWasmClient}
					version={version}
				/>
				<BalancesModal
					escrow={escrow}
					cosmWasmClient={cosmWasmClient}
					version={version}
				/>
			</ButtonGroup>
		</>
	);
};

export default EscrowSection;
