"use client";

import type { ExecuteInstruction } from "@cosmjs/cosmwasm-stargate";
import { useChain } from "@cosmos-kit/react";
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Spinner,
} from "@nextui-org/react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
	ArenaEscrowClient,
	ArenaEscrowQueryClient,
} from "~/codegen/ArenaEscrow.client";
import {
	arenaEscrowQueryKeys,
	useArenaEscrowDumpStateQuery,
	useArenaEscrowWithdrawMutation,
} from "~/codegen/ArenaEscrow.react-query";
import type {
	DumpStateResponse,
	ExecuteMsg as EscrowExecuteMsg,
} from "~/codegen/ArenaEscrow.types";
import type { CompetitionStatus } from "~/codegen/ArenaWagerModule.types";
import type { ExecuteMsg as Cw20ExecuteMsg } from "~/codegen/Cw20Base.types";
import { getCompetitionQueryKey } from "~/helpers/CompetitionHelpers";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import type { CompetitionResponse } from "~/types/CompetitionResponse";
import type { CompetitionType } from "~/types/CompetitionType";
import BalanceDisplay from "./BalanceDisplay";
import BalancesModal from "./BalancesModal";
import DuesModal from "./DuesModal";
import InitialDuesModal from "./InitialDuesModal";

interface EscrowSectionProps {
	escrow: string;
	competitionStatus: CompetitionStatus;
	competitionType: CompetitionType;
	competitionId: string;
}

const EscrowSection = ({
	escrow,
	competitionStatus,
	competitionType,
	competitionId,
}: EscrowSectionProps) => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const { getSigningCosmWasmClient, address } = useChain(env.CHAIN);
	const queryClient = useQueryClient();
	const { data, isLoading } = useArenaEscrowDumpStateQuery({
		client:
			cosmWasmClient && new ArenaEscrowQueryClient(cosmWasmClient, escrow),
		args: { addr: address },
	});
	const withdrawMutation = useArenaEscrowWithdrawMutation({
		onMutate: async () => {
			queryClient.setQueryData<DumpStateResponse | undefined>(
				arenaEscrowQueryKeys.dumpState(escrow, { addr: address }),
				(old) => {
					if (old) {
						return { ...old, balance: undefined };
					}
					return old;
				},
			);

			await queryClient.cancelQueries(arenaEscrowQueryKeys.balances(escrow));
			await queryClient.invalidateQueries(
				arenaEscrowQueryKeys.balances(escrow),
			);

			await queryClient.cancelQueries(arenaEscrowQueryKeys.dues(escrow));
			await queryClient.invalidateQueries(arenaEscrowQueryKeys.dues(escrow));
		},
	});

	const deposit = async () => {
		try {
			if (!address) throw "Could not get user address";
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

			toast.success("Funds have been sucessfully deposited");

			// Check if the response contains the activate action, so we can mark the competition as active
			if (
				response.events.find((event) =>
					event.attributes.find(
						(attr) => attr.key === "action" && attr.value === "activate",
					),
				)
			) {
				queryClient.setQueryData<CompetitionResponse | undefined>(
					getCompetitionQueryKey(env, competitionType, competitionId),
					(old) => {
						if (old) {
							return { ...old, status: "active" };
						}
						return old;
					},
				);
				toast.success("The competition is now active");
			}
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

			await withdrawMutation.mutateAsync(
				{
					client: escrowClient,
					msg: {},
				},
				{
					onSuccess: () => {
						toast.success("Funds have been successfully withdrawn");
					},
				},
			);
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
			<div className="grid grid-cols-12 gap-4">
				{data.balance && (
					<Card className="col-span-12 lg:col-span-4 md:col-span-6">
						<CardHeader>User Balance</CardHeader>
						<CardBody>
							<BalanceDisplay balance={data.balance} />
						</CardBody>
						{!data.is_locked && (
							<CardFooter>
								<Button color="primary" onClick={withdraw}>
									Withdraw
								</Button>
							</CardFooter>
						)}
					</Card>
				)}
				{data.due && (
					<Card className="col-span-12 lg:col-span-4 md:col-span-6">
						<CardHeader>User Due</CardHeader>
						<CardBody>
							<BalanceDisplay balance={data.due} />
						</CardBody>
						{!data.is_locked && (
							<CardFooter>
								<Button color="primary" onClick={deposit}>
									Deposit
								</Button>
							</CardFooter>
						)}
					</Card>
				)}
				{data.total_balance && (
					<Card className="col-span-12 lg:col-span-4 md:col-span-6">
						<CardHeader>Total Balance</CardHeader>
						<CardBody>
							<BalanceDisplay balance={data.total_balance} />
						</CardBody>
					</Card>
				)}
			</div>
			<div className="flex flex-col justify-center gap-2 overflow-x-auto md:flex-row md:justify-start">
				{competitionStatus === "pending" && <DuesModal escrow={escrow} />}
				{competitionStatus !== "pending" && (
					<InitialDuesModal escrow={escrow} />
				)}
				<BalancesModal escrow={escrow} />
			</div>
		</>
	);
};

export default EscrowSection;
