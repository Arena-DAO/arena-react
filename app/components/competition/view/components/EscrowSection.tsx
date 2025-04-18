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
	addToast,
} from "@heroui/react";
import { type InfiniteData, useQueryClient } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

import { Vault } from "lucide-react";
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
	ArrayOfMemberBalanceChecked,
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
import DonateModal from "./DonateModal";
import DuesModal from "./DuesModal";
import InitialDuesModal from "./InitialDuesModal";

interface PageData {
	items: ArrayOfMemberBalanceChecked;
}

// Types for the consolidated context
type CompetitionContext = {
	type: "competition";
	competitionStatus: CompetitionStatus;
	competitionType: CompetitionType;
	competitionId: string;
};

type EnrollmentContext = {
	type: "enrollment";
	enrollmentId: string;
};

type EscrowContext = CompetitionContext | EnrollmentContext;

interface EscrowSectionProps extends PropsWithChildren {
	escrow: string;
	context: EscrowContext;
}

const EscrowSection = ({ escrow, context, children }: EscrowSectionProps) => {
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const { getSigningCosmWasmClient, address } = useChain(env.CHAIN);
	const queryClient = useQueryClient();
	const { data, isLoading } = useArenaEscrowDumpStateQuery({
		client:
			cosmWasmClient && new ArenaEscrowQueryClient(cosmWasmClient, escrow),
		args: { addr: address },
	});
	const withdrawMutation = useArenaEscrowWithdrawMutation();

	const deposit = async () => {
		try {
			if (!address) throw "Could not get user address";
			if (!data || !data.due) throw "User has none due";

			const client = await getSigningCosmWasmClient();

			const msgs: ExecuteInstruction[] = [];

			if (data.due.native && data.due.native.length > 0) {
				msgs.push({
					contractAddress: escrow,
					msg: { receive_native: {} } as EscrowExecuteMsg,
					funds: data.due.native,
				});
			}
			if (data.due.cw20 && data.due.cw20.length > 0) {
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

			addToast({
				color: "success",
				description: "Funds have been successfully deposited",
			});

			// Handle competition activation if in competition context
			if (context.type === "competition") {
				if (
					response.events.find((event) =>
						event.attributes.find(
							(attr) => attr.key === "action" && attr.value === "activate",
						),
					)
				) {
					queryClient.setQueryData<CompetitionResponse | undefined>(
						getCompetitionQueryKey(
							env,
							context.competitionType,
							context.competitionId,
						),
						(old) => {
							if (old) {
								return { ...old, status: { active: { activation_height: 0 } } };
							}
							return old;
						},
					);
					addToast({
						color: "success",
						description: "The competition is now active",
					});
				}
			}

			await queryClient.invalidateQueries(
				arenaEscrowQueryKeys.dumpState(escrow, { addr: address }),
			);

			queryClient.setQueryData<InfiniteData<PageData> | undefined>(
				arenaEscrowQueryKeys.dues(escrow),
				(old) => {
					if (!old) return old;

					return {
						...old,
						pages: old.pages.map((page) => ({
							...page,
							items: page.items.filter((due) => due.addr !== address),
						})),
					};
				},
			);
			await queryClient.invalidateQueries(
				arenaEscrowQueryKeys.balances(escrow),
			);
		} catch (e) {
			console.error(e);
			addToast({ color: "danger", description: (e as Error).toString() });
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
					onSuccess: async () => {
						addToast({
							color: "success",
							description: "Funds have been successfully withdrawn",
						});

						await queryClient.invalidateQueries(
							arenaEscrowQueryKeys.dumpState(escrow, { addr: address }),
						);

						queryClient.setQueryData<InfiniteData<PageData> | undefined>(
							arenaEscrowQueryKeys.balances(escrow),
							(old) => {
								if (!old) return old;

								return {
									...old,
									pages: old.pages.map((page) => ({
										...page,
										items: page.items.filter((due) => due.addr !== address),
									})),
								};
							},
						);
						await queryClient.invalidateQueries(
							arenaEscrowQueryKeys.dues(escrow),
						);
					},
				},
			);
		} catch (e) {
			console.error(e);
			addToast({ color: "danger", description: (e as Error).toString() });
		}
	};

	if (isLoading || !data) {
		return (
			<div className="flex justify-center">
				<Spinner size="lg" />
			</div>
		);
	}

	return (
		<Card className="w-full">
			<CardHeader>
				<div className="flex items-center gap-2">
					<Vault className="text-primary-500" />
					<h2 className="font-semibold text-xl">Escrow Information</h2>
				</div>
			</CardHeader>
			<CardBody className="space-y-4">
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{data.balance && (
						<Card shadow="sm">
							<CardHeader>
								<h3 className="font-medium text-lg">User Balance</h3>
							</CardHeader>
							<CardBody>
								<BalanceDisplay balance={data.balance} />
							</CardBody>
							{!data.is_locked && (
								<CardFooter>
									<Button color="primary" onPress={withdraw}>
										Withdraw
									</Button>
								</CardFooter>
							)}
						</Card>
					)}
					{data.due && (
						<Card shadow="sm">
							<CardHeader>
								<h3 className="font-medium text-lg">User Due</h3>
							</CardHeader>
							<CardBody>
								<BalanceDisplay balance={data.due} />
							</CardBody>
							{!data.is_locked && (
								<CardBody>
									<Button color="primary" onPress={deposit} fullWidth>
										Deposit
									</Button>
								</CardBody>
							)}
						</Card>
					)}
					{data.total_balance && (
						<Card shadow="sm">
							<CardHeader>
								<h3 className="font-medium text-lg">Total Balance</h3>
							</CardHeader>
							<CardBody>
								<BalanceDisplay balance={data.total_balance} />
							</CardBody>
						</Card>
					)}
				</div>
				{children}
			</CardBody>
			<CardFooter className="gap-4">
				{context.type === "competition" &&
					context.competitionStatus === "pending" && (
						<DuesModal escrow={escrow} />
					)}
				{context.type === "competition" &&
					context.competitionStatus !== "pending" && (
						<InitialDuesModal escrow={escrow} />
					)}
				<BalancesModal escrow={escrow} />
				<DonateModal escrow={escrow} />
			</CardFooter>
		</Card>
	);
};

export default EscrowSection;
