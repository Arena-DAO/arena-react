"use client";

import Profile from "@/components/Profile";
import RulesDisplay from "@/components/competition/RulesDisplay";
import CategoryDisplay from "@/enrollment/view/components/CategoryDisplay";
import { useChain } from "@cosmos-kit/react";
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
} from "@nextui-org/react";
import type { PropsWithChildren } from "react";
import { BsYinYang } from "react-icons/bs";
import { isValidContractAddress } from "~/helpers/AddressHelpers";
import { isJailed } from "~/helpers/ArenaHelpers";
import { useEnv } from "~/hooks/useEnv";
import type { CompetitionResponse } from "~/types/CompetitionResponse";
import type { CompetitionType } from "~/types/CompetitionType";
import CompetitionStatusDisplay from "../CompetitionStatusDisplay";
import ExpirationDisplay from "../ExpirationDisplay";
import CompetitionActions from "./components/CompetitionActions";
import EscrowSection from "./components/EscrowSection";
import EvidenceSection from "./components/EvidenceSection";
import ResultSection from "./components/ResultSection";
import StatsTable from "./components/StatsTable";
import GroupMembersModal from "../GroupMembersModal";

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
	const { address } = useChain(env.CHAIN);

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
					<CardFooter>
						<GroupMembersModal groupContract={competition.group_contract} />
					</CardFooter>
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

			<Card>
				<CardHeader>
					<h2 className="font-semibold text-xl">Competition Stats</h2>
				</CardHeader>
				<CardBody>
					<StatsTable moduleAddr={moduleAddr} competitionId={competition.id} />
				</CardBody>
			</Card>

			{(isJailed(competition.status) || competition.status === "inactive") && (
				<EvidenceSection
					moduleAddr={moduleAddr}
					competitionId={competition.id}
					hideIfEmpty={competition.status === "inactive"}
				/>
			)}

			{competition.escrow && (
				<EscrowSection
					escrow={competition.escrow}
					competitionStatus={competition.status}
					competitionType={competitionType}
					competitionId={competition.id}
				>
					{competition.fees && competition.fees.length > 0 && (
						<Card>
							<CardHeader>
								<h2 className="font-semibold text-xl">
									Additional Layered Fees
								</h2>
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
			)}

			{competition.status === "inactive" && (
				<ResultSection moduleAddr={moduleAddr} competitionId={competition.id} />
			)}

			<CompetitionActions
				competition={competition}
				hideProcess={hideProcess}
				competitionType={competitionType}
				moduleAddr={moduleAddr}
			/>
			{children}
		</div>
	);
};

export default ViewCompetition;
