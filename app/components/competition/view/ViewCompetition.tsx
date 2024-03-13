"use client";

import { CopyAddressButton } from "@/components/CopyAddressButton";
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
	Textarea,
	Tooltip,
} from "@nextui-org/react";
import { BsYinYang } from "react-icons/bs";
import { ArenaWagerModuleQueryClient } from "~/codegen/ArenaWagerModule.client";
import { useArenaWagerModuleCompetitionQuery } from "~/codegen/ArenaWagerModule.react-query";
import { isValidContractAddress } from "~/helpers/AddressHelpers";
import { statusColors } from "~/helpers/ArenaHelpers";
import { formatExpirationTime } from "~/helpers/DateHelpers";
import { useEnv } from "~/hooks/useEnv";
import type { WithClient } from "~/types/util";
import BalancesModal from "./components/BalancesModal";
import DuesModal from "./components/DuesModal";
import EscrowSection from "./components/EscrowSection";
import RulesetsSection from "./components/RulesetsSection";

interface ViewCompetitionProps {
	competitionId: string;
}

const ViewCompetition = ({
	cosmWasmClient,
	competitionId,
}: WithClient<ViewCompetitionProps>) => {
	const { data: env } = useEnv();
	const { address } = useChain(env.CHAIN);
	const { data } = useArenaWagerModuleCompetitionQuery({
		client: new ArenaWagerModuleQueryClient(
			cosmWasmClient,
			env.ARENA_WAGER_MODULE_ADDRESS,
		),
		args: {
			competitionId,
		},
	});

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader className="flex justify-between">
					<h2 className="text-2xl font-bold">Host</h2>
					{data && (
						<Badge
							content="expired"
							color="warning"
							aria-label="Expired"
							isInvisible={!data.is_expired}
						>
							<Chip color={statusColors[data.status]}>{data.status}</Chip>
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
								endContent={
									<div className="pointer-events-none flex items-center">
										<span className="text-default-400 text-small">UTC</span>
									</div>
								}
							/>
						)}
					</>
				)}
			</div>
			{data?.rulesets.map((rulesetId) => (
				<RulesetsSection
					rulesetId={rulesetId}
					cosmWasmClient={cosmWasmClient}
				/>
			))}
			<Card>
				<CardHeader>Rules</CardHeader>
				<CardBody>
					<ol className="list-decimal list-inside">
						{data?.rules.map((rule, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: No better option
							<li key={i}>{rule}</li>
						))}
					</ol>
				</CardBody>
			</Card>
			{data?.escrow && (
				<>
					<EscrowSection
						cosmWasmClient={cosmWasmClient}
						address={address}
						escrow={data.escrow}
					/>
					<ButtonGroup>
						<DuesModal escrow={data.escrow} cosmWasmClient={cosmWasmClient} />
						<BalancesModal
							escrow={data.escrow}
							cosmWasmClient={cosmWasmClient}
						/>
					</ButtonGroup>
				</>
			)}
		</div>
	);
};

export default ViewCompetition;
