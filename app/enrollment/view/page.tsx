"use client";

import Profile from "@/components/Profile";
import {
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Chip,
	Image,
	Slider,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	Tooltip,
} from "@nextui-org/react";
import NextImage from "next/image";
import { useSearchParams } from "next/navigation";
import { FiClock, FiUsers } from "react-icons/fi";
import { ArenaCompetitionEnrollmentQueryClient } from "~/codegen/ArenaCompetitionEnrollment.client";
import { useArenaCompetitionEnrollmentEnrollmentQuery } from "~/codegen/ArenaCompetitionEnrollment.react-query";
import {
	calculateCurrentPool,
	calculateMinMembers,
	formatExpiration,
	getCompetitionTypeDisplay,
} from "~/helpers/EnrollmentHelpers";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import EnrollButton from "./components/EnrollButton";
import EnrollmentMembers from "./components/EnrollmentMembers";
import RulesSection from "./components/RulesSection";
import TokenInfo from "@/components/TokenInfo";
import DistributionDisplay from "./components/DistributionDisplay";

const EnrollmentView = () => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const searchParams = useSearchParams();
	const enrollmentId = searchParams?.get("enrollmentId");

	const {
		data: enrollment,
		isLoading,
		isError,
	} = useArenaCompetitionEnrollmentEnrollmentQuery({
		client:
			cosmWasmClient &&
			new ArenaCompetitionEnrollmentQueryClient(
				cosmWasmClient,
				env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
			),
		args: { id: enrollmentId || "" },
		options: { enabled: !!enrollmentId && !!cosmWasmClient },
	});

	if (isLoading) return <div>Loading...</div>;
	if (isError) return <div>Error loading enrollment details</div>;
	if (!enrollment) return <div>No enrollment found</div>;

	const currentMembers = Number(enrollment.current_members);
	const maxMembers = Number(enrollment.max_members);
	const minMembers = enrollment.min_members
		? Number(enrollment.min_members)
		: calculateMinMembers(enrollment.competition_type);
	const currentPool = enrollment.entry_fee
		? calculateCurrentPool(enrollment.entry_fee, enrollment.current_members)
		: null;

	return (
		<div className="container mx-auto space-y-4 p-4">
			<Card className="mx-auto max-w-7xl">
				<CardBody className="overflow-hidden p-0">
					{enrollment.competition_info.banner && (
						<Image
							as={NextImage}
							src={enrollment.competition_info.banner}
							alt={enrollment.competition_info.name}
							width={1280}
							height={720}
							className="z-0 h-full w-full object-cover"
							removeWrapper
						/>
					)}
				</CardBody>
				<CardFooter className="flex justify-center">
					<h1 className="text-center font-bold text-2xl">
						{enrollment.competition_info.name}
					</h1>
				</CardFooter>
			</Card>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<h2 className="font-semibold text-xl">Host</h2>
					</CardHeader>
					<CardBody>
						<div>
							<Profile
								address={enrollment.host}
								categoryId={enrollment.category_id}
							/>
						</div>
					</CardBody>
				</Card>

				<Card>
					<CardHeader>
						<h2 className="font-semibold text-xl">Expiration</h2>
					</CardHeader>
					<CardBody>
						<div className="flex items-center">
							<FiClock className="mr-2" />
							{formatExpiration(enrollment.expiration)}
						</div>
					</CardBody>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<h2 className="font-semibold text-xl">Description</h2>
				</CardHeader>
				<CardBody>
					<p>{enrollment.competition_info.description}</p>
				</CardBody>
			</Card>

			<Card>
				<CardHeader className="flex items-center justify-between">
					<h2 className="font-semibold text-xl">Competition Type</h2>
					<Chip color="primary" variant="flat">
						{getCompetitionTypeDisplay(enrollment.competition_type)}
					</Chip>
				</CardHeader>
				<CardBody>
					{"league" in enrollment.competition_type && (
						<div className="flex flex-col gap-4">
							<h3 className="font-semibold text-lg">League Information</h3>
							<div className="flex flex-wrap gap-2 pb-2">
								<Chip>
									<span className="font-semibold">Win:</span>{" "}
									{enrollment.competition_type.league.match_win_points}
								</Chip>
								<Chip>
									<span className="font-semibold">Draw:</span>{" "}
									{enrollment.competition_type.league.match_draw_points}
								</Chip>
								<Chip>
									<span className="font-semibold">Lose:</span>{" "}
									{enrollment.competition_type.league.match_lose_points}
								</Chip>
							</div>
							<DistributionDisplay
								distribution={enrollment.competition_type.league.distribution}
							/>
						</div>
					)}
					{"tournament" in enrollment.competition_type && (
						<div className="mt-4">
							<h3 className="font-semibold text-lg">Tournament Information</h3>
							<p>
								Elimination Type:{" "}
								{"double_elimination" ===
								enrollment.competition_type.tournament.elimination_type
									? "Double Elimination"
									: `Single Elimination (Play Third Place Match: ${
											enrollment.competition_type.tournament.elimination_type
												.single_elimination.play_third_place_match
												? "Yes"
												: "No"
										})`}
							</p>
							<DistributionDisplay
								distribution={
									enrollment.competition_type.tournament.distribution
								}
							/>
						</div>
					)}
				</CardBody>
			</Card>

			<Card>
				<CardHeader>
					<h2 className="font-semibold text-xl">Rules and Rulesets</h2>
				</CardHeader>
				<CardBody>
					<RulesSection
						rules={enrollment.competition_info.rules}
						rulesets={enrollment.competition_info.rulesets}
						category_id={enrollment.category_id}
					/>
				</CardBody>
			</Card>

			<Card>
				<CardHeader>
					<h2 className="font-semibold text-xl">Enrollment Progress</h2>
				</CardHeader>
				<CardBody>
					<Slider
						label="Enrollment Progress"
						step={1}
						maxValue={maxMembers}
						minValue={0}
						value={currentMembers}
						color="primary"
						showTooltip={true}
						startContent={<FiUsers />}
						endContent={<FiUsers />}
						isDisabled
						marks={[
							{
								value: minMembers,
								label: "Min",
							},
							{
								value: maxMembers,
								label: "Max",
							},
						]}
					/>
					<div className="mt-2 flex justify-between text-sm">
						<Tooltip content="Minimum required members">
							<span className="flex items-center">
								<FiUsers className="mr-1" /> Min: {minMembers}
							</span>
						</Tooltip>
						<span>Current: {currentMembers}</span>
						<Tooltip content="Maximum allowed members">
							<span className="flex items-center">
								<FiUsers className="mr-1" /> Max: {maxMembers}
							</span>
						</Tooltip>
					</div>
				</CardBody>
			</Card>

			<EnrollmentMembers
				enrollmentId={enrollment.id}
				categoryId={enrollment.category_id}
			/>

			{enrollment.competition_info.additional_layered_fees && (
				<Card>
					<CardHeader>
						<h2 className="font-semibold text-xl">Additional Fees</h2>
					</CardHeader>
					<CardBody>
						<Table aria-label="Additional Fees" removeWrapper>
							<TableHeader>
								<TableColumn>Receiver</TableColumn>
								<TableColumn>Tax</TableColumn>
							</TableHeader>
							<TableBody>
								{enrollment.competition_info.additional_layered_fees.map(
									(fee, index) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: best option
										<TableRow key={index}>
											<TableCell>
												<Profile
													address={fee.receiver}
													categoryId={enrollment.category_id}
												/>
											</TableCell>
											<TableCell>{Number.parseFloat(fee.tax) * 100}%</TableCell>
										</TableRow>
									),
								)}
							</TableBody>
						</Table>
					</CardBody>
				</Card>
			)}

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<h2 className="font-semibold text-xl">Entry Fee</h2>
					</CardHeader>
					<CardBody>
						{enrollment.entry_fee ? (
							<TokenInfo
								isNative
								denomOrAddress={enrollment.entry_fee.denom}
								amount={BigInt(enrollment.entry_fee.amount)}
							/>
						) : (
							<span className="text-sm">Free</span>
						)}
					</CardBody>
				</Card>

				{currentPool && (
					<Card>
						<CardHeader>
							<h2 className="font-semibold text-xl">Current Pool</h2>
						</CardHeader>
						<CardBody>
							<TokenInfo
								isNative
								denomOrAddress={currentPool.denom}
								amount={BigInt(currentPool.amount)}
							/>
						</CardBody>
					</Card>
				)}
			</div>

			<div className="flex justify-end">
				<EnrollButton
					enrollmentId={enrollment.id}
					isExpired={enrollment.has_triggered_expiration}
					isFull={currentMembers >= maxMembers}
					entryFee={enrollment.entry_fee}
				/>
			</div>
		</div>
	);
};

export default EnrollmentView;
