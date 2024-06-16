"use client";

import MaybeLink from "@/components/MaybeLink";
import Profile from "@/components/Profile";
import {
	Accordion,
	AccordionItem,
	Badge,
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Chip,
	DatePicker,
	Input,
	Link,
	Progress,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	Textarea,
	Tooltip,
} from "@nextui-org/react";
import { useSearchParams } from "next/navigation";
import type { PropsWithChildren } from "react";
import { BsArrowLeft, BsHourglassBottom, BsYinYang } from "react-icons/bs";
import { isValidContractAddress } from "~/helpers/AddressHelpers";
import { statusColors } from "~/helpers/ArenaHelpers";
import { formatExpirationTime } from "~/helpers/DateHelpers";
import { useEnv } from "~/hooks/useEnv";
import type { CompetitionResponse } from "~/types/CompetitionResponse";
import type { CompetitionType } from "~/types/CompetitionType";
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
	children,
	hideProcess = false,
	competitionType,
}: ViewCompetitionProps) => {
	const { data: env } = useEnv();

	const searchParams = useSearchParams();

	const category = searchParams?.get("category");

	return (
		<div className="space-y-4">
			{category && (
				<Tooltip content="Return to competitions">
					<Button as={Link} isIconOnly href={`/compete?category=${category}`}>
						<BsArrowLeft />
					</Button>
				</Tooltip>
			)}
			<Card>
				<CardHeader className="flex justify-between">
					<h2>Host</h2>
					<Badge
						isOneChar
						content={<BsHourglassBottom />}
						color="warning"
						aria-label="Expired"
						isInvisible={
							!(
								competition.is_expired &&
								(competition.status === "active" ||
									competition.status === "pending")
							)
						}
					>
						<Chip color={statusColors[competition.status]}>
							{competition.status}
						</Chip>
					</Badge>
				</CardHeader>
				<CardBody>
					<div className="flex justify-between">
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
					<p className="text-warning text-xs">
						Please remind your players to track their gameplay to help resolve
						any disputes quickly and fairly.
					</p>
				</CardFooter>
			</Card>
			<Input label="Name" value={competition.name} readOnly />
			<Textarea label="Description" value={competition.description} readOnly />
			<div className="grid grid-cols-12 gap-2">
				<Input
					className="col-span-12 lg:col-span-4 sm:col-span-6"
					label="Expiration"
					value={
						"at_time" in competition.expiration
							? "At Time"
							: "at_height" in competition.expiration
								? "At Height"
								: "Never"
					}
					readOnly
				/>
				{"at_height" in competition.expiration && (
					<Input
						className="col-span-12 lg:col-span-4 sm:col-span-6"
						label="Height"
						type="number"
						value={competition.expiration.at_height.toString()}
						readOnly
					/>
				)}
				{"at_time" in competition.expiration && (
					<DatePicker
						className="col-span-12 lg:col-span-4 sm:col-span-6"
						label="Time"
						value={formatExpirationTime(competition.expiration.at_time)}
						isReadOnly
					/>
				)}
			</div>
			{(competition.rulesets.length > 0 || competition.rules.length > 0) && (
				<Card className="min-w-fit max-w-lg">
					<CardHeader>Rules</CardHeader>
					<CardBody className="space-y-4">
						{competition.rulesets.map((rulesetId) => (
							<RulesetsSection key={rulesetId} rulesetId={rulesetId} />
						))}
						<ul className="list-inside list-disc">
							{competition.rules.map((item, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: Best option for now
								<li key={i} className="break-all">
									<MaybeLink content={item} />
								</li>
							))}
						</ul>
					</CardBody>
				</Card>
			)}
			{(competition.status === "jailed" ||
				competition.status === "inactive") && (
				<EvidenceSection
					moduleAddr={moduleAddr}
					competitionId={competition.id}
					hideIfEmpty={competition.status === "inactive"}
				/>
			)}
			<div className="flex gap-2 overflow-x-auto">
				{!hideProcess && competition.status === "active" && (
					<ProcessForm
						moduleAddr={moduleAddr}
						competitionId={competition.id}
						host={competition.host}
						competitionType={competitionType}
						escrow={competition.escrow}
						categoryId={competition.category_id}
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
			</div>
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
			{competition.fees && (
				<Accordion variant="splitted">
					<AccordionItem
						key="1"
						aria-label="Additional Layered Fees"
						title="Additional Layered Fees"
						subtitle="Set additional fees to be automatically sent when a competition is processed"
						isCompact
						className="gap-4 overflow-x-auto"
					>
						<Table aria-label="Distribution" removeWrapper>
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
										<TableCell>
											<Progress
												aria-label="Percentage"
												value={Number.parseFloat(x.tax) * 100}
												color="primary"
												showValueLabel
											/>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</AccordionItem>
				</Accordion>
			)}
			{children}
		</div>
	);
};

export default ViewCompetition;
