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
import { useSearchParams } from "next/navigation";
import { FiUsers } from "react-icons/fi";
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
import DistributionDisplay from "./components/DistributionDisplay";
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
			<div className="flex justify-center">
				<Spinner label="Loading enrollment..." />
			</div>
		);
	if (!enrollment) return <div>No enrollment found</div>;

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
			<div className="container mx-auto space-y-4">
				<h1 className="text-center font-bold text-3xl">
					{enrollment.competition_info.name}
				</h1>
				{enrollment.competition_info.banner && (
					<Image
						src={enrollment.competition_info.banner}
						alt={enrollment.competition_info.name}
						className="z-0 h-full w-full"
						removeWrapper
					/>
				)}
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<Card>
						<CardHeader>
							<h2>Host</h2>
						</CardHeader>
						<CardBody>
							<div>
								<Profile address={enrollment.host} />
							</div>
						</CardBody>
						<CardFooter className="justify-between gap-2">
							<GroupMembersModal
								groupContract={enrollment.competition_info.group_contract}
								enrollmentId={
									address === enrollment.host ? enrollment.id : undefined
								}
							/>
							{!enrollment.has_finalized && enrollment.host === address && (
								<FinalizeButton
									enrollmentId={enrollment.id}
									competitionDate={enrollment.competition_info.date}
									deadlineBefore={enrollment.duration_before}
									isFull={currentMembers >= maxMembers}
								/>
							)}
						</CardFooter>
					</Card>

					<Card>
						<CardHeader>
							<h2 className="font-semibold text-xl">Competition Dates</h2>
						</CardHeader>
						<CardBody className="gap-4">
							<CompetitionDates
								competitionDateNanos={enrollment.competition_info.date}
								duration={enrollment.competition_info.duration}
								deadlineBefore={enrollment.duration_before}
							/>
						</CardBody>
					</Card>
				</div>

				<EscrowSection
					escrow={enrollment.competition_info.escrow}
					context={{ type: "enrollment", enrollmentId: enrollment.id }}
				>
					{enrollment.competition_info.additional_layered_fees &&
						enrollment.competition_info.additional_layered_fees.length > 0 && (
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
											{enrollment.competition_info.additional_layered_fees.map(
												(x, i) => (
													// biome-ignore lint/suspicious/noArrayIndexKey: best option
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

				<Card>
					<CardHeader>
						<h2>Description</h2>
					</CardHeader>
					<CardBody className="gap-4">
						<div className="flex items-center justify-between">
							<CategoryDisplay />
							<CompetitionTypeDisplay type={enrollment.competition_type} />
						</div>
						{enrollment.required_team_size && (
							<div>
								<span className="font-medium">Required Team Size:</span>{" "}
								{enrollment.required_team_size}
							</div>
						)}
						{"league" in enrollment.competition_type && (
							<div className="flex flex-col gap-2">
								<h3>League Information</h3>
								<div className="flex flex-wrap gap-2 pb-2">
									<Tooltip content="Number of points awarded for a win">
										<Chip>
											<span className="font-semibold">Win:</span>{" "}
											{enrollment.competition_type.league.match_win_points}
										</Chip>
									</Tooltip>
									<Tooltip content="Number of points awarded for a draw">
										<Chip>
											<span className="font-semibold">Draw:</span>{" "}
											{enrollment.competition_type.league.match_draw_points}
										</Chip>
									</Tooltip>
									<Tooltip content="Number of points awarded for a loss">
										<Chip>
											<span className="font-semibold">Lose:</span>{" "}
											{enrollment.competition_type.league.match_lose_points}
										</Chip>
									</Tooltip>
								</div>
								<DistributionDisplay
									distribution={enrollment.competition_type.league.distribution}
								/>
							</div>
						)}
						{"tournament" in enrollment.competition_type && (
							<div className="flex flex-col gap-2">
								<h3>Tournament Information</h3>
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
						<p>{enrollment.competition_info.description}</p>
					</CardBody>
				</Card>

				{((enrollment.competition_info.rules &&
					enrollment.competition_info.rules.length > 0) ||
					(enrollment.competition_info.rulesets &&
						enrollment.competition_info.rulesets.length > 0)) && (
					<Card>
						<CardHeader>
							<h2>Rules and Rulesets</h2>
						</CardHeader>
						<CardBody>
							<RulesDisplay
								rules={enrollment.competition_info.rules}
								rulesets={enrollment.competition_info.rulesets}
							/>
						</CardBody>
					</Card>
				)}

				<Card>
					<CardHeader>
						<h2>Enrollment Progress</h2>
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

				{enrollment.competition_info.additional_layered_fees &&
					enrollment.competition_info.additional_layered_fees.length > 0 && (
						<Card>
							<CardHeader>
								<h2>Additional Fees</h2>
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
														<Profile address={fee.receiver} />
													</TableCell>
													<TableCell>
														{Number.parseFloat(fee.tax) * 100}%
													</TableCell>
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
								<h2>Current Pool</h2>
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

				<div className="flex justify-end gap-2">
					{enrollment.has_finalized &&
						enrollment.competition_info.competition_id && (
							<Button
								color="primary"
								as={Link}
								href={`/${path}/view?competitionId=${enrollment.competition_info.competition_id}`}
							>
								View
							</Button>
						)}
					{!enrollment.has_finalized && (
						<EnrollmentActionsButton
							enrollmentId={enrollment.id}
							isFull={currentMembers >= maxMembers}
							entryFee={enrollment.entry_fee}
							groupContract={enrollment.competition_info.group_contract}
						/>
					)}
				</div>
			</div>
		</CategoryProvider>
	);
};

export default EnrollmentView;
