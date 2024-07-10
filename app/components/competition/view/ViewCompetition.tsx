"use client";

import MaybeLink from "@/components/MaybeLink";
import Profile from "@/components/Profile";
import CategoryDisplay from "@/enrollment/view/components/CategoryDisplay";
import { useChain } from "@cosmos-kit/react";
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Divider,
	Image,
	Link,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	Tooltip,
} from "@nextui-org/react";
import { useQueryClient } from "@tanstack/react-query";
import NextImage from "next/image";
import type { PropsWithChildren } from "react";
import { BsYinYang } from "react-icons/bs";
import { toast } from "react-toastify";
import { ArenaWagerModuleClient } from "~/codegen/ArenaWagerModule.client";
import { useArenaWagerModuleActivateCompetitionManuallyMutation } from "~/codegen/ArenaWagerModule.react-query";
import { isValidContractAddress } from "~/helpers/AddressHelpers";
import { getCompetitionQueryKey } from "~/helpers/CompetitionHelpers";
import { useEnv } from "~/hooks/useEnv";
import type { CompetitionResponse } from "~/types/CompetitionResponse";
import type { CompetitionType } from "~/types/CompetitionType";
import CompetitionStatusDisplay from "../CompetitionStatusDisplay";
import ExpirationDisplay from "../ExpirationDisplay";
import EscrowSection from "./components/EscrowSection";
import EvidenceSection from "./components/EvidenceSection";
import PresetDistributionForm from "./components/PresetDistributionForm";
import ProcessForm from "./components/ProcessForm";
import ResultSection from "./components/ResultSection";
import RulesetsSection from "./components/RulesetsSection";

interface ViewCompetitionProps extends PropsWithChildren {
	moduleAddr: string;
	competition: CompetitionResponse;
	hideProcess?: boolean;
	competitionType: CompetitionType;
}

const ViewCompetition = ({
	moduleAddr,
	competition,
	hideProcess = false,
	competitionType,
	children,
}: ViewCompetitionProps) => {
	const { data: env } = useEnv();
	const { getSigningCosmWasmClient, address } = useChain(env.CHAIN);
	const queryClient = useQueryClient();

	const manualActivationMutation =
		useArenaWagerModuleActivateCompetitionManuallyMutation();

	const handleActivate = async () => {
		if (!address) {
			toast.error("Please connect your wallet");
			return;
		}

		const client = await getSigningCosmWasmClient();

		try {
			await manualActivationMutation.mutateAsync(
				{
					client: new ArenaWagerModuleClient(client, address, moduleAddr),
					msg: { id: competition.id },
				},
				{
					onSuccess: () => {
						toast.success("Competition activated successfully");
						queryClient.setQueryData<CompetitionResponse | undefined>(
							getCompetitionQueryKey(env, competitionType, competition.id),
							(oldData) => {
								if (!oldData) return oldData;

								return { ...oldData, status: "active" };
							},
						);
					},
				},
			);
		} catch (e) {
			console.error(e);
			toast.error((e as Error).toString());
		}
	};

	return (
		<div className="space-y-6">
			<h1 className="text-center font-bold text-4xl">{competition.name}</h1>

			{competition.banner && (
				<Image
					as={NextImage}
					src={competition.banner}
					alt={competition.name}
					width={1280}
					height={720}
					className="h-64 w-full rounded-lg object-cover"
					removeWrapper
				/>
			)}

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<h2 className="font-semibold text-xl">Host</h2>
					</CardHeader>
					<CardBody>
						<div className="flex items-center justify-between">
							<Profile address={competition.host} />
							{isValidContractAddress(competition.host, env.BECH32_PREFIX) && (
								<Tooltip content="View through DAO DAO">
									<Button
										isIconOnly
										as={Link}
										href={`${env.DAO_DAO_URL}/dao/${
											competition.host
										}/apps?url=${encodeURIComponent(window.location.href)}`}
										isExternal
									>
										<BsYinYang />
									</Button>
								</Tooltip>
							)}
						</div>
					</CardBody>
				</Card>

				<Card>
					<CardHeader>
						<h2 className="font-semibold text-xl">Expiration</h2>
					</CardHeader>
					<CardBody>
						<div className="flex items-center justify-between">
							<ExpirationDisplay expiration={competition.expiration} />
							<CompetitionStatusDisplay
								status={competition.status}
								isExpired={competition.is_expired}
							/>
						</div>
					</CardBody>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<h2 className="font-semibold text-xl">Description</h2>
				</CardHeader>
				<CardBody className="gap-2">
					<CategoryDisplay />
					<p>{competition.description}</p>
				</CardBody>
				<CardFooter>
					<div className="text-warning text-xs">
						Make sure to track results for evidence!
					</div>
				</CardFooter>
			</Card>

			{competition.rules.length > 0 ||
				(competition.rulesets.length > 0 && (
					<Card>
						<CardHeader>
							<h2 className="font-semibold text-xl">Rules and Rulesets</h2>
						</CardHeader>
						<CardBody className="space-y-4">
							{competition.rulesets.map((rulesetId) => (
								<RulesetsSection key={rulesetId} rulesetId={rulesetId} />
							))}
							{competition.rules.length > 0 && (
								<>
									<Divider />
									<h3 className="font-semibold text-lg">Additional Rules</h3>
									<ul className="list-inside list-disc">
										{competition.rules.map((item, i) => (
											// biome-ignore lint/suspicious/noArrayIndexKey: best option
											<li key={i} className="break-all">
												<MaybeLink content={item} />
											</li>
										))}
									</ul>
								</>
							)}
						</CardBody>
					</Card>
				))}

			{(competition.status === "jailed" ||
				competition.status === "inactive") && (
				<EvidenceSection
					moduleAddr={moduleAddr}
					competitionId={competition.id}
					hideIfEmpty={competition.status === "inactive"}
				/>
			)}

			{competition.fees && (
				<Card>
					<CardHeader>
						<h2 className="font-semibold text-xl">Additional Layered Fees</h2>
					</CardHeader>
					<CardBody>
						<Table aria-label="Additional Fees" removeWrapper>
							<TableHeader>
								<TableColumn>Recipient</TableColumn>
								<TableColumn>Percentage</TableColumn>
							</TableHeader>
							<TableBody emptyContent="No additional fees">
								{competition.fees.map((x, i) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: best option
									<TableRow key={i}>
										<TableCell>
											<Profile address={x.receiver} />
										</TableCell>
										<TableCell>{Number.parseFloat(x.tax) * 100}%</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardBody>
				</Card>
			)}

			{competition.escrow && (
				<EscrowSection
					escrow={competition.escrow}
					competitionStatus={competition.status}
					competitionType={competitionType}
					competitionId={competition.id}
				/>
			)}

			{competition.status === "inactive" && (
				<ResultSection moduleAddr={moduleAddr} competitionId={competition.id} />
			)}

			<div className="flex justify-end gap-2 overflow-x-auto">
				{!hideProcess && competition.status === "active" && (
					<ProcessForm
						moduleAddr={moduleAddr}
						competitionId={competition.id}
						host={competition.host}
						competitionType={competitionType}
						escrow={competition.escrow}
					/>
				)}
				{competition.is_expired &&
					competition.status !== "inactive" &&
					competition.status !== "pending" && (
						<ProcessForm
							moduleAddr={moduleAddr}
							competitionId={competition.id}
							is_expired
							competitionType={competitionType}
						/>
					)}
				{competition.status !== "inactive" && competition.escrow && (
					<PresetDistributionForm escrow={competition.escrow} />
				)}
				{competition.status === "pending" && (
					<Tooltip content="Once activated, users cannot make changes to the escrow's state">
						<Button
							color="primary"
							onClick={handleActivate}
							isLoading={manualActivationMutation.isLoading}
							isDisabled={
								manualActivationMutation.isLoading ||
								address !== competition.host
							}
						>
							Activate
						</Button>
					</Tooltip>
				)}
			</div>
			{children}
		</div>
	);
};

export default ViewCompetition;
