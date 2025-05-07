"use client";
import Profile from "@/components/Profile";
import TokenInfo from "@/components/TokenInfo";
import CompetitionTypeDisplay from "@/components/competition/CompetitionTypeDisplay";
import CompetitionDates from "@/components/competition/view/components/CompetitionDates";
import EscrowSection from "@/components/competition/view/components/EscrowSection";
import { useChain } from "@cosmos-kit/react";
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Chip,
	Divider,
	Image,
	Link,
	Slider,
	Spinner,
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
	BarChart3,
	Calendar,
	DollarSign,
	Info,
	Percent,
	Scroll,
	Share2,
	Trophy,
	User,
	Users,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { ArenaCompetitionEnrollmentQueryClient } from "~/codegen/ArenaCompetitionEnrollment.client";
import { useArenaCompetitionEnrollmentEnrollmentQuery } from "~/codegen/ArenaCompetitionEnrollment.react-query";
import { CategoryProvider } from "~/contexts/CategoryContext";
import {
	calculateCurrentPool,
	calculateMinMembers,
} from "~/helpers/EnrollmentHelpers";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import GroupMembersModal from "../../components/competition/GroupMembersModal";
import RulesDisplay from "../../components/competition/RulesDisplay";
import CategoryDisplay from "../../components/competition/view/components/CategoryDisplay";
import DistributionDisplay from "../../components/competition/view/components/DistributionDisplay";
import EnrollmentActionsButton from "./components/EnrollmentActionsButton";
import FinalizeButton from "./components/FinalizeButton";

const EnrollmentView = () => {
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const searchParams = useSearchParams();
	const enrollmentId = searchParams?.get("enrollmentId");
	const { address } = useChain(env.CHAIN);

	const { data: enrollment, isLoading } =
		useArenaCompetitionEnrollmentEnrollmentQuery({
			client:
				cosmWasmClient &&
				new ArenaCompetitionEnrollmentQueryClient(
					cosmWasmClient,
					env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
				),
			args: { enrollmentId: enrollmentId || "" },
			options: { enabled: !!enrollmentId && !!cosmWasmClient },
		});

	if (isLoading)
		return (
			<div className="flex min-h-64 items-center justify-center">
				<Spinner label="Loading enrollment..." />
			</div>
		);
	if (!enrollment)
		return <div className="text-center text-lg">No enrollment found</div>;

	const currentMembers = Number(enrollment.current_members);
	const maxMembers = Number(enrollment.max_members);
	const minMembers = enrollment.min_members
		? Number(enrollment.min_members)
		: calculateMinMembers(enrollment.competition_type);
	const currentPool = enrollment.entry_fee
		? calculateCurrentPool(enrollment.entry_fee, enrollment.current_members)
		: null;
	const path =
		"wager" in enrollment.competition_type
			? "wager"
			: "tournament" in enrollment.competition_type
				? "tournament"
				: "league";

	return (
		<CategoryProvider value={enrollment.category_id}>
			<div className="container mx-auto space-y-8">
				{/* Header Section */}
				<div className="space-y-4 text-center">
					<h1 className="font-bold text-4xl tracking-tight">
						{enrollment.competition_info.name}
					</h1>
					<div className="flex items-center justify-center space-x-2">
						<Chip color="primary">Enrollment</Chip>
						<CompetitionTypeDisplay type={enrollment.competition_type} />
					</div>
				</div>

				{/* Banner Image */}
				{enrollment.competition_info.banner && (
					<div className="relative h-64 w-full overflow-hidden rounded-xl sm:h-80 md:h-96">
						<Image
							src={enrollment.competition_info.banner}
							alt={enrollment.competition_info.name}
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
								<div>
									<Profile address={enrollment.host} />
								</div>
							</CardBody>
							<Divider />
							<CardFooter className="flex-col items-stretch gap-3">
								<GroupMembersModal
									groupContract={enrollment.competition_info.group_contract}
									enrollmentId={
										address === enrollment.host ? enrollment.id : undefined
									}
								/>
								{!enrollment.has_finalized &&
									(enrollment.host === address ||
										enrollment.host === env.ARENA_DAO_ADDRESS) && (
										<FinalizeButton
											enrollmentId={enrollment.id}
											competitionDate={enrollment.competition_info.date}
											deadlineBefore={enrollment.duration_before}
											isFull={currentMembers >= maxMembers}
										/>
									)}
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
									competitionDateNanos={enrollment.competition_info.date}
									duration={enrollment.competition_info.duration}
									deadlineBefore={enrollment.duration_before}
								/>
							</CardBody>
						</Card>

						{/* Entry Fee Card */}
						<Card shadow="md">
							<CardHeader>
								<div className="flex items-center gap-2">
									<DollarSign className="text-primary-500" />
									<h2 className="font-semibold text-xl">Entry Fee</h2>
								</div>
							</CardHeader>
							<CardBody>
								{enrollment.entry_fee ? (
									<TokenInfo
										isNative
										denomOrAddress={enrollment.entry_fee.denom}
										amount={BigInt(enrollment.entry_fee.amount)}
									/>
								) : (
									<span className="text-default-600">Free Entry</span>
								)}
							</CardBody>
							{currentPool && (
								<>
									<Divider />
									<CardFooter className="flex-col gap-2">
										<div className="flex items-center gap-2">
											<Trophy size={18} className="text-primary-500" />
											<h3 className="font-medium text-lg">Current Pool</h3>
										</div>
										<TokenInfo
											isNative
											denomOrAddress={currentPool.denom}
											amount={BigInt(currentPool.amount)}
										/>
									</CardFooter>
								</>
							)}
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
								<div className="flex flex-wrap items-center justify-between gap-2">
									<CategoryDisplay />
								</div>

								{enrollment.required_team_size && (
									<div className="flex items-center gap-2 rounded-lg p-3">
										<Users size={18} className="text-primary-500" />
										<span className="font-medium">Required Team Size:</span>{" "}
										<span className="text-default-700">
											{enrollment.required_team_size}
										</span>
									</div>
								)}

								{"league" in enrollment.competition_type && (
									<div className="flex flex-col gap-3 rounded-lg p-4">
										<h3 className="flex items-center gap-2 font-semibold text-lg">
											<BarChart3 size={18} className="text-primary-500" />
											League Information
										</h3>
										<div className="flex flex-wrap gap-2 pb-2">
											<Tooltip content="Number of points awarded for a win">
												<Chip color="success">
													<span className="font-semibold">Win:</span>{" "}
													{enrollment.competition_type.league.match_win_points}
												</Chip>
											</Tooltip>
											<Tooltip content="Number of points awarded for a draw">
												<Chip color="warning">
													<span className="font-semibold">Draw:</span>{" "}
													{enrollment.competition_type.league.match_draw_points}
												</Chip>
											</Tooltip>
											<Tooltip content="Number of points awarded for a loss">
												<Chip color="danger">
													<span className="font-semibold">Lose:</span>{" "}
													{enrollment.competition_type.league.match_lose_points}
												</Chip>
											</Tooltip>
										</div>
										<div className="space-y-2">
											<h3 className="font-semibold">Distribution</h3>
											<DistributionDisplay
												distribution={
													enrollment.competition_type.league.distribution
												}
											/>
										</div>
									</div>
								)}

								{"tournament" in enrollment.competition_type && (
									<div className="flex flex-col gap-3 rounded-lg p-4">
										<h3 className="flex items-center gap-2 font-semibold text-lg">
											<Trophy size={18} className="text-primary-500" />
											Tournament Information
										</h3>
										<p className="text-default-700">
											<span className="font-medium">Elimination Type:</span>{" "}
											{"double_elimination" ===
											enrollment.competition_type.tournament.elimination_type
												? "Double Elimination"
												: `Single Elimination (Play Third Place Match: ${
														enrollment.competition_type.tournament
															.elimination_type.single_elimination
															.play_third_place_match
															? "Yes"
															: "No"
													})`}
										</p>
										<div className="space-y-2">
											<h3 className="flex items-center gap-2 font-semibold text-lg">
												<Share2 size={18} className="text-primary-500" />
												Distribution
											</h3>
											<DistributionDisplay
												distribution={
													enrollment.competition_type.tournament.distribution
												}
											/>
										</div>
									</div>
								)}

								<p className="text-default-700 leading-relaxed">
									{enrollment.competition_info.description}
								</p>
							</CardBody>
						</Card>

						{/* Prize Pool Section */}
						<EscrowSection
							escrow={enrollment.competition_info.escrow}
							context={{ type: "enrollment", enrollmentId: enrollment.id }}
						>
							{enrollment.competition_info.additional_layered_fees &&
								enrollment.competition_info.additional_layered_fees.length >
									0 && (
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
													{enrollment.competition_info.additional_layered_fees.map(
														(x, i) => (
															// biome-ignore lint/suspicious/noArrayIndexKey: Best option for now
															<TableRow key={i}>
																<TableCell>
																	<Profile address={x.receiver} />
																</TableCell>
																<TableCell>
																	{Number.parseFloat(x.tax) * 100}%
																</TableCell>
															</TableRow>
														),
													)}
												</TableBody>
											</Table>
										</CardBody>
									</Card>
								)}
						</EscrowSection>

						{/* Rules Section */}
						{((enrollment.competition_info.rules &&
							enrollment.competition_info.rules.length > 0) ||
							(enrollment.competition_info.rulesets &&
								enrollment.competition_info.rulesets.length > 0)) && (
							<Card shadow="md">
								<CardHeader>
									<div className="flex items-center gap-2">
										<Scroll className="text-primary-500" />
										<h2 className="font-semibold text-xl">
											Rules and Rulesets
										</h2>
									</div>
								</CardHeader>
								<CardBody>
									<RulesDisplay
										rules={enrollment.competition_info.rules}
										rulesets={enrollment.competition_info.rulesets}
									/>
								</CardBody>
							</Card>
						)}

						{/* Enrollment Progress */}
						<Card shadow="md">
							<CardHeader>
								<div className="flex items-center gap-2">
									<Users className="text-primary-500" />
									<h2 className="font-semibold text-xl">Enrollment Progress</h2>
								</div>
							</CardHeader>
							<CardBody className="space-y-4">
								<Slider
									label="Enrollment Progress"
									step={1}
									maxValue={maxMembers}
									minValue={0}
									value={currentMembers}
									color="primary"
									showTooltip={true}
									startContent={<Users size={16} />}
									endContent={<Users size={16} />}
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
											<Users size={14} className="mr-1 text-warning-500" /> Min:{" "}
											{minMembers}
										</span>
									</Tooltip>
									<span className="font-medium">Current: {currentMembers}</span>
									<Tooltip content="Maximum allowed members">
										<span className="flex items-center">
											<Users size={14} className="mr-1 text-success-500" /> Max:{" "}
											{maxMembers}
										</span>
									</Tooltip>
								</div>

								{currentMembers < minMembers && (
									<div className="mt-2 flex items-center gap-2 rounded-lg p-2 text-sm text-warning-500">
										<AlertTriangle size={16} />
										<span>Minimum enrollment target not yet reached</span>
									</div>
								)}

								{currentMembers >= maxMembers && (
									<div className="mt-2 flex items-center gap-2 rounded-lg p-2 text-sm text-success-500">
										<Info size={16} />
										<span>Maximum enrollment capacity reached</span>
									</div>
								)}
							</CardBody>
							<Divider />
							<CardFooter className="justify-end gap-2">
								{enrollment.has_finalized &&
									enrollment.competition_info.competition_id && (
										<Button
											color="primary"
											as={Link}
											href={`/${path}/view?competitionId=${enrollment.competition_info.competition_id}`}
										>
											View Competition
										</Button>
									)}
								{!enrollment.has_finalized && (
									<EnrollmentActionsButton
										enrollmentId={enrollment.id}
										isFull={currentMembers >= maxMembers}
										entryFee={enrollment.entry_fee}
										groupContract={enrollment.competition_info.group_contract}
										requiredTeamSize={enrollment.required_team_size}
									/>
								)}
							</CardFooter>
						</Card>
					</div>
				</div>
			</div>
		</CategoryProvider>
	);
};

export default EnrollmentView;
