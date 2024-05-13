"use client";

import MaybeLink from "@/components/MaybeLink";
import Profile from "@/components/Profile";
import { useChain } from "@cosmos-kit/react";
import {
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
	Textarea,
	Tooltip,
} from "@nextui-org/react";
import { useSearchParams } from "next/navigation";
import type { Dispatch, PropsWithChildren, SetStateAction } from "react";
import { BsArrowLeft, BsHourglassBottom, BsYinYang } from "react-icons/bs";
import type {
	CompetitionResponseForEmpty,
	CompetitionStatus,
} from "~/codegen/ArenaWagerModule.types";
import { isValidContractAddress } from "~/helpers/AddressHelpers";
import { statusColors } from "~/helpers/ArenaHelpers";
import { formatExpirationTime } from "~/helpers/DateHelpers";
import { useEnv } from "~/hooks/useEnv";
import type { WithClient } from "~/types/util";
import EscrowSection from "./components/EscrowSection";
import EvidenceSection from "./components/EvidenceSection";
import PresetDistributionForm from "./components/PresetDistributionForm";
import ProcessForm from "./components/ProcessForm";
import ResultSection from "./components/ResultSection";
import RulesetsSection from "./components/RulesetsSection";

interface ViewCompetitionProps extends PropsWithChildren {
	moduleAddr: string;
	competition: Omit<CompetitionResponseForEmpty, "extension">;
	hideProcess?: boolean;
	status: CompetitionStatus;
	setStatus: Dispatch<SetStateAction<CompetitionStatus>>;
}

const ViewCompetition = ({
	cosmWasmClient,
	moduleAddr,
	competition,
	children,
	hideProcess = false,
	status,
	setStatus,
}: WithClient<ViewCompetitionProps>) => {
	const { data: env } = useEnv();
	const { address } = useChain(env.CHAIN);

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
								(status === "active" || status === "pending")
							)
						}
					>
						<Chip color={statusColors[status]}>{status}</Chip>
					</Badge>
				</CardHeader>
				<CardBody>
					<div className="flex justify-between">
						<Profile
							address={competition.host}
							cosmWasmClient={cosmWasmClient}
						/>
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
							<RulesetsSection
								key={rulesetId}
								rulesetId={rulesetId}
								cosmWasmClient={cosmWasmClient}
							/>
						))}
						<ul className="list-inside list-disc">
							{competition.rules.map((item, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: Best option for now
								<li key={i}>
									<MaybeLink content={item} />
								</li>
							))}
						</ul>
					</CardBody>
				</Card>
			)}
			{(status === "jailed" || status === "inactive") && (
				<EvidenceSection
					moduleAddr={moduleAddr}
					competitionId={competition.id}
					cosmWasmClient={cosmWasmClient}
					hideIfEmpty={status === "inactive"}
				/>
			)}
			<div className="block space-x-2 overflow-x-auto">
				{!hideProcess && status === "active" && (
					<ProcessForm
						moduleAddr={moduleAddr}
						competitionId={competition.id}
						host={competition.host}
					/>
				)}
				{competition.is_expired &&
					status !== "inactive" &&
					status !== "pending" && (
						<ProcessForm
							moduleAddr={moduleAddr}
							competitionId={competition.id}
							setCompetitionStatus={setStatus}
							is_expired
						/>
					)}
				{status !== "inactive" && competition.escrow && (
					<PresetDistributionForm
						escrow={competition.escrow}
						cosmWasmClient={cosmWasmClient}
					/>
				)}
			</div>
			{competition.escrow && (
				<EscrowSection
					cosmWasmClient={cosmWasmClient}
					address={address}
					escrow={competition.escrow}
					setCompetitionStatus={setStatus}
					status={status}
				/>
			)}
			{status === "inactive" && (
				<ResultSection
					cosmWasmClient={cosmWasmClient}
					moduleAddr={moduleAddr}
					competitionId={competition.id}
				/>
			)}
			{children}
		</div>
	);
};

export default ViewCompetition;
