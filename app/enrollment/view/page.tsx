"use client";

import Profile from "@/components/Profile";
import {
	Card,
	CardBody,
	CardFooter,
	CardHeader,
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
import { FiClock, FiDollarSign, FiUsers } from "react-icons/fi";
import { ArenaCompetitionEnrollmentQueryClient } from "~/codegen/ArenaCompetitionEnrollment.client";
import { useArenaCompetitionEnrollmentEnrollmentQuery } from "~/codegen/ArenaCompetitionEnrollment.react-query";
import {
	calculateCurrentPool,
	calculateMinMembers,
	formatExpiration,
} from "~/helpers/EnrollmentHelpers";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import EnrollButton from "./components/EnrollButton";
import EnrollmentMembers from "./components/EnrollmentMembers";
import RulesSection from "./components/RulesSection";

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
		<div className="container mx-auto space-y-8 p-4">
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

			<RulesSection
				rules={enrollment.competition_info.rules}
				rulesets={enrollment.competition_info.rulesets}
				category_id={enrollment.category_id}
			/>

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
						<Table aria-label="Additional Fees">
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
											<TableCell>{fee.tax}</TableCell>
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
						<div className="flex items-center">
							<FiDollarSign className="mr-2" />
							{enrollment.entry_fee
								? `${enrollment.entry_fee.amount} ${enrollment.entry_fee.denom}`
								: "Free"}
						</div>
					</CardBody>
				</Card>

				{currentPool && (
					<Card>
						<CardHeader>
							<h2 className="font-semibold text-xl">Current Pool</h2>
						</CardHeader>
						<CardBody>
							<div className="flex items-center">
								<FiDollarSign className="mr-2" />
								{currentPool}
							</div>
						</CardBody>
					</Card>
				)}
			</div>

			<div className="flex justify-center">
				<EnrollButton
					enrollmentId={enrollment.id}
					isExpired={enrollment.has_triggered_expiration}
					isFull={currentMembers >= maxMembers}
				/>
			</div>
		</div>
	);
};

export default EnrollmentView;
