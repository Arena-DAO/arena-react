"use client";

import Profile from "@/components/Profile";
import RulesDisplay from "@/components/competition/RulesDisplay";
import CategoryDisplay from "@/components/competition/view/components/CategoryDisplay";
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Image,
	Link,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	Tooltip,
} from "@heroui/react";
import type { PropsWithChildren } from "react";
import { BsYinYang } from "react-icons/bs";
import { isValidContractAddress } from "~/helpers/AddressHelpers";
import { useEnv } from "~/hooks/useEnv";
import { useIsExpired } from "~/hooks/useIsExpired";
import type { CompetitionResponse } from "~/types/CompetitionResponse";
import type { CompetitionType } from "~/types/CompetitionType";
import CompetitionStatusDisplay from "../CompetitionStatusDisplay";
import GroupMembersModal from "../GroupMembersModal";
import CompetitionActions from "./components/CompetitionActions";
import CompetitionDates from "./components/CompetitionDates";
import EscrowSection from "./components/EscrowSection";
import EvidenceSection from "./components/EvidenceSection";
import ResultSection from "./components/ResultSection";

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
	const env = useEnv();
	const isExpired = useIsExpired(competition.date, competition.duration);

	return (
		<div className="space-y-6">
			<h1 className="text-center font-bold text-4xl">{competition.name}</h1>
			{competition.banner && (
				<Image
					src={competition.banner}
					alt={competition.name}
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
					<CardFooter className="justify-between gap-4 overflow-x-auto">
						<div className="flex gap-2">
							<GroupMembersModal groupContract={competition.group_contract} />
						</div>
						<CompetitionActions
							competition={competition}
							competitionType={competitionType}
							moduleAddr={moduleAddr}
							hideProcess={hideProcess}
						/>
					</CardFooter>
				</Card>

				<Card>
					<CardHeader>
						<h2 className="font-semibold text-xl">Competition Dates</h2>
					</CardHeader>
					<CardBody>
						<CompetitionDates
							competitionDateNanos={competition.date}
							duration={competition.duration}
						/>
					</CardBody>
					<CardFooter>
						<CompetitionStatusDisplay
							status={competition.status}
							isExpired={isExpired}
						/>
					</CardFooter>
				</Card>
			</div>
			<EscrowSection
				escrow={competition.escrow}
				context={{
					type: "competition",
					competitionStatus: competition.status,
					competitionType,
					competitionId: competition.id,
				}}
			>
				{competition.fees && competition.fees.length > 0 && (
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
			</EscrowSection>
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
			{((competition.rules && competition.rules.length > 0) ||
				(competition.rulesets && competition.rulesets.length > 0)) && (
				<Card>
					<CardHeader>
						<h2>Rules and Rulesets</h2>
					</CardHeader>
					<CardBody>
						<RulesDisplay
							rules={competition.rules}
							rulesets={competition.rulesets}
						/>
					</CardBody>
				</Card>
			)}
			{competition.status !== "pending" && (
				<EvidenceSection
					moduleAddr={moduleAddr}
					competitionId={competition.id}
					hideIfEmpty={competition.status === "inactive"}
				/>
			)}
			{competition.status === "inactive" && (
				<ResultSection moduleAddr={moduleAddr} competitionId={competition.id} />
			)}
			{children}
		</div>
	);
};

export default ViewCompetition;
