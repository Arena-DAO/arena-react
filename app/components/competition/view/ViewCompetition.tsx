"use client";

import { CopyAddressButton } from "@/components/CopyAddressButton";
import MaybeLink from "@/components/MaybeLink";
import Profile from "@/components/Profile";
import { useChain } from "@cosmos-kit/react";
import {
	Badge,
	Button,
	ButtonGroup,
	Card,
	CardBody,
	CardHeader,
	Chip,
	Input,
	Link,
	Select,
	SelectItem,
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
import { useEffect, useState } from "react";
import { BsArrowLeft, BsHourglassBottom, BsYinYang } from "react-icons/bs";
import { ArenaWagerModuleQueryClient } from "~/codegen/ArenaWagerModule.client";
import { useArenaWagerModuleCompetitionQuery } from "~/codegen/ArenaWagerModule.react-query";
import type { CompetitionStatus } from "~/codegen/ArenaWagerModule.types";
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

interface ViewCompetitionProps {
	competitionId: string;
	moduleAddr: string;
}

const ViewCompetition = ({
	cosmWasmClient,
	competitionId,
	moduleAddr,
}: WithClient<ViewCompetitionProps>) => {
	const { data: env } = useEnv();
	const { address } = useChain(env.CHAIN);
	const { data } = useArenaWagerModuleCompetitionQuery({
		client: new ArenaWagerModuleQueryClient(cosmWasmClient, moduleAddr),
		args: {
			competitionId,
		},
	});
	const [status, setStatus] = useState<CompetitionStatus>("pending");
	useEffect(() => {
		if (data) {
			setStatus(data.status);
		}
	}, [data]);

	const searchParams = useSearchParams();

	const category = searchParams?.get("category");

	return (
		<>
			{category && (
				<Tooltip content="Return to competitions">
					<Button as={Link} isIconOnly href={`/compete?category=${category}`}>
						<BsArrowLeft />
					</Button>
				</Tooltip>
			)}
			<Card>
				<CardHeader className="flex justify-between">
					<h2 className="text-2xl font-bold">Host</h2>
					{data && (
						<Badge
							isOneChar
							content={<BsHourglassBottom />}
							color="warning"
							aria-label="Expired"
							isInvisible={
								!(
									data.is_expired &&
									(status === "active" || status === "pending")
								)
							}
						>
							<Chip color={statusColors[status]}>{status}</Chip>
						</Badge>
					)}
				</CardHeader>
				<CardBody>
					{data?.host && (
						<div className="flex justify-between">
							<Profile address={data.host} cosmWasmClient={cosmWasmClient} />
							<ButtonGroup>
								<CopyAddressButton address={data?.host} />
								{isValidContractAddress(data.host, env.BECH32_PREFIX) && (
									<Tooltip content="View on DAO DAO">
										<Button
											isIconOnly
											as={Link}
											href={`${env.DAO_DAO_URL}/dao/${data.host}`}
											isExternal
										>
											<BsYinYang />
										</Button>
									</Tooltip>
								)}
							</ButtonGroup>
						</div>
					)}
				</CardBody>
			</Card>
			<Input label="Name" value={data?.name} readOnly />
			<Textarea label="Description" value={data?.description} readOnly />
			<div className="grid grid-cols-12 gap-4">
				{data?.expiration && (
					<>
						<Select
							label="Expiration"
							className="col-span-12 sm:col-span-6 md:col-span-4"
							defaultSelectedKeys={[
								"at_time" in data.expiration
									? "at_time"
									: "at_height" in data.expiration
									  ? "at_height"
									  : "never",
							]}
							isDisabled
						>
							<SelectItem value="at_time" key="at_time">
								At Time
							</SelectItem>
							<SelectItem value="at_height" key="at_height">
								At Height
							</SelectItem>
							<SelectItem value="never" key="never">
								Never
							</SelectItem>
						</Select>
						{"at_height" in data.expiration && (
							<Input
								className="col-span-12 sm:col-span-6 lg:col-span-4"
								label="Height"
								type="number"
								value={data.expiration.at_height.toString()}
								readOnly
							/>
						)}
						{"at_time" in data.expiration && (
							<Input
								className="col-span-12 sm:col-span-6 lg:col-span-4"
								label="Time"
								type="datetime-local"
								value={formatExpirationTime(data.expiration.at_time)}
								readOnly
							/>
						)}
					</>
				)}
			</div>
			{data && (
				<Card>
					<CardHeader>Rules</CardHeader>
					<CardBody className="space-y-4">
						{data.rulesets.map((rulesetId) => (
							<RulesetsSection
								rulesetId={rulesetId}
								cosmWasmClient={cosmWasmClient}
							/>
						))}
						<Table aria-label="Rules" removeWrapper>
							<TableHeader>
								<TableColumn>Rule</TableColumn>
							</TableHeader>
							<TableBody emptyContent="No rules given...">
								{data.rules.map((item, i) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: Best option for now
									<TableRow key={i}>
										<TableCell>
											<MaybeLink content={item} />
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardBody>
				</Card>
			)}
			{(status === "jailed" || status === "inactive") && (
				<EvidenceSection
					moduleAddr={moduleAddr}
					competitionId={competitionId}
					cosmWasmClient={cosmWasmClient}
					hideIfEmpty={status === "inactive"}
				/>
			)}
			<div className="block space-x-2">
				{data?.host && status === "active" && (
					<ProcessForm
						moduleAddr={moduleAddr}
						competitionId={competitionId}
						host={data.host}
					/>
				)}
				{data?.is_expired && status !== "inactive" && (
					<ProcessForm
						moduleAddr={moduleAddr}
						competitionId={competitionId}
						setCompetitionStatus={setStatus}
						is_expired
					/>
				)}
				{status !== "inactive" && data?.escrow && (
					<PresetDistributionForm
						escrow={data.escrow}
						cosmWasmClient={cosmWasmClient}
					/>
				)}
			</div>
			{data?.escrow && (
				<EscrowSection
					cosmWasmClient={cosmWasmClient}
					address={address}
					escrow={data.escrow}
					setCompetitionStatus={setStatus}
				/>
			)}
			{status === "inactive" && (
				<ResultSection
					cosmWasmClient={cosmWasmClient}
					moduleAddr={moduleAddr}
					competitionId={competitionId}
				/>
			)}
		</>
	);
};

export default ViewCompetition;
