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
} from "@heroui/react";
import {
	AlertTriangle,
	Calendar,
	Info,
	Percent,
	Scroll,
	User,
} from "lucide-react";
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
		<div className="space-y-8">
			{/* Competition Header */}
			<div className="space-y-4 text-center">
				<h1 className="font-bold text-4xl tracking-tight">
					{competition.name}
				</h1>
				<div className="flex justify-center">
					<CompetitionStatusDisplay
						status={competition.status}
						isExpired={isExpired}
					/>
				</div>
			</div>

			{/* Banner Image */}
			{competition.banner && (
				<div className="relative h-64 w-full overflow-hidden rounded-xl sm:h-80 md:h-96">
					<Image
						src={competition.banner}
						alt={competition.name}
						className="h-full w-full object-contain"
						removeWrapper
					/>
				</div>
			)}

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
				{/* Left Column - Host & Actions */}
				<div className="space-y-6">
					<Card shadow="md">
						<CardHeader>
							<div className="flex items-center gap-2">
								<User className="text-primary-500" />
								<h2 className="font-semibold text-xl">Host</h2>
							</div>
						</CardHeader>
						<CardBody>
							<div className="flex items-center justify-between">
								<Profile address={competition.host} />
								{isValidContractAddress(
									competition.host,
									env.BECH32_PREFIX,
								) && (
									<Tooltip content="View through DAO DAO">
										<Button
											isIconOnly
											as={Link}
											href={`${env.DAO_DAO_URL}/dao/${
												competition.host
											}/apps?url=${encodeURIComponent(window.location.href)}`}
											isExternal
											color="primary"
											variant="light"
										>
											<BsYinYang />
										</Button>
									</Tooltip>
								)}
							</div>
						</CardBody>
						<Divider />
						<CardFooter className="flex-col items-stretch gap-3">
							<GroupMembersModal groupContract={competition.group_contract} />
							<CompetitionActions
								competition={competition}
								competitionType={competitionType}
								moduleAddr={moduleAddr}
								hideProcess={hideProcess}
							/>
						</CardFooter>
					</Card>

					<Card shadow="md">
						<CardHeader>
							<div className="flex items-center gap-2">
								<Calendar className="text-primary-500" />
								<h2 className="font-semibold text-xl">Competition Dates</h2>
							</div>
						</CardHeader>
						<CardBody>
							<CompetitionDates
								competitionDateNanos={competition.date}
								duration={competition.duration}
							/>
						</CardBody>
					</Card>
				</div>

				{/* Center & Right Columns - Main Content */}
				<div className="space-y-6 lg:col-span-2">
					{/* Description Card */}
					<Card shadow="md">
						<CardHeader>
							<div className="flex items-center gap-2">
								<Info className="text-primary-500" />
								<h2 className="font-semibold text-xl">
									About this Competition
								</h2>
							</div>
						</CardHeader>
						<CardBody className="space-y-4">
							<CategoryDisplay />
							<p className="text-default-700 leading-relaxed">
								{competition.description}
							</p>
						</CardBody>
						{competition.status !== "inactive" && (
							<CardFooter>
								<div className="flex items-center gap-2 text-sm text-warning-500">
									<AlertTriangle />
									<span>Make sure to track results for evidence!</span>
								</div>
							</CardFooter>
						)}
					</Card>

					{/* Prize Pool Section */}
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
							<Card shadow="md">
								<CardHeader>
									<div className="flex items-center gap-2">
										<Percent className="text-primary-500" />
										<h2 className="font-semibold text-xl">
											Additional Layered Fees
										</h2>
									</div>
								</CardHeader>
								<CardBody>
									<Table aria-label="Additional Fees" removeWrapper>
										<TableHeader>
											<TableColumn>Recipient</TableColumn>
											<TableColumn>Percentage</TableColumn>
										</TableHeader>
										<TableBody emptyContent="No additional fees">
											{competition.fees.map((x, i) => (
												// biome-ignore lint/suspicious/noArrayIndexKey: Best option for now
												<TableRow key={i}>
													<TableCell>
														<Profile address={x.receiver} />
													</TableCell>
													<TableCell>
														{Number.parseFloat(x.tax) * 100}%
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</CardBody>
							</Card>
						)}
					</EscrowSection>

					{/* Rules Section */}
					{((competition.rules && competition.rules.length > 0) ||
						(competition.rulesets && competition.rulesets.length > 0)) && (
						<Card shadow="md">
							<CardHeader>
								<div className="flex items-center gap-2">
									<Scroll className="text-primary-500" />
									<h2 className="font-semibold text-xl">Rules and Rulesets</h2>
								</div>
							</CardHeader>
							<CardBody>
								<RulesDisplay
									rules={competition.rules}
									rulesets={competition.rulesets}
								/>
							</CardBody>
						</Card>
					)}

					{/* Evidence Section */}
					{competition.status !== "pending" && (
						<EvidenceSection
							moduleAddr={moduleAddr}
							competitionId={competition.id}
						/>
					)}

					{/* Results Section */}
					{competition.status === "inactive" && (
						<ResultSection
							moduleAddr={moduleAddr}
							competitionId={competition.id}
						/>
					)}
				</div>
			</div>

			{children}
		</div>
	);
};

export default ViewCompetition;
