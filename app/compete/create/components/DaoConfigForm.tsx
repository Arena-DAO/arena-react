"use client";

import {
	Card,
	Divider,
	Input,
	Radio,
	RadioGroup,
	Select,
	SelectItem,
	Switch,
	Tooltip,
} from "@heroui/react";
import { HelpCircle, Info } from "lucide-react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import type { CreateCompetitionFormValues } from "~/config/schemas/CreateCompetitionSchema";
import { useEnv } from "~/hooks/useEnv";

// Predefined voting duration options
const VOTING_DURATIONS = [
	{ label: "1 hour", value: 3600 },
	{ label: "6 hours", value: 21600 },
	{ label: "12 hours", value: 43200 },
	{ label: "1 day", value: 86400 },
	{ label: "3 days", value: 259200 },
	{ label: "1 week", value: 604800 },
];

const DaoConfigForm = () => {
	const env = useEnv();
	const {
		control,
		setValue,
		formState: { isSubmitting },
	} = useFormContext<CreateCompetitionFormValues>();

	const useDaoHost = useWatch({
		control,
		name: "enrollmentInfo.useDaoHost",
	});

	const thresholdType = useWatch({
		control,
		name: "enrollmentInfo.useDaoHost.threshold",
	});

	// Initialize DAO configuration with sensible defaults
	const handleEnableDaoConfig = () => {
		setValue("enrollmentInfo.useDaoHost", {
			dao_code_id: env.CODE_ID_DAO_CORE,
			proposal_single_code_id: env.CODE_ID_DAO_PROPOSAL_SINGLE,
			prepropose_single_code_id: env.CODE_ID_DAO_PREPROPOSE_SINGLE,
			cw4_voting_code_id: env.CODE_ID_CW4_VOTING,
			max_voting_period: {
				time: 86400, // 1 day in seconds
			},
			threshold: {
				absolute_percentage: {
					percentage: { majority: {} },
				},
			},
		});
	};

	const handleDisableDaoConfig = () => {
		setValue("enrollmentInfo.useDaoHost", undefined);
	};

	return (
		<div className="mt-6 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<h3 className="font-semibold text-lg">Community Governance</h3>
					<Tooltip content="Enable democratic decision-making for this competition">
						<span className="cursor-help text-foreground/70">
							<HelpCircle size={16} />
						</span>
					</Tooltip>
				</div>

				<Controller
					name="enrollmentInfo.useDaoHost"
					control={control}
					render={({ field }) => (
						<Switch
							isSelected={!!field.value}
							onValueChange={(isSelected) => {
								if (isSelected) {
									handleEnableDaoConfig();
								} else {
									handleDisableDaoConfig();
								}
							}}
							isDisabled={isSubmitting}
							aria-label="Enable community governance"
						>
							{field.value ? "Enabled" : "Disabled"}
						</Switch>
					)}
				/>
			</div>

			<p className="text-foreground/70 text-sm">
				When enabled, participants can vote on competition decisions and changes
			</p>

			{useDaoHost && (
				<>
					<Divider className="my-4" />

					<div className="space-y-6">
						<div>
							<h4 className="mb-2 font-medium">
								How long can participants vote?
							</h4>
							<Controller
								name="enrollmentInfo.useDaoHost.max_voting_period.time"
								control={control}
								render={({ field, fieldState: { error } }) => (
									<Select
										label="Voting Duration"
										selectedKeys={[field.value.toString()]}
										onChange={(e) =>
											field.onChange(Number.parseInt(e.target.value))
										}
										isDisabled={isSubmitting}
										isInvalid={!!error}
										errorMessage={error?.message}
										className="max-w-xs"
										aria-label="Select voting duration"
									>
										{VOTING_DURATIONS.map((duration) => (
											<SelectItem key={duration.value}>
												{duration.label}
											</SelectItem>
										))}
									</Select>
								)}
							/>
						</div>

						<div>
							<h4 className="mb-3 font-medium" id="decision-method-label">
								How are decisions made?
							</h4>
							<Controller
								name="enrollmentInfo.useDaoHost.threshold"
								control={control}
								render={({ field }) => {
									// Helper to determine current type
									const getCurrentType = () => {
										if (field.value && "absolute_percentage" in field.value) {
											const percentage =
												field.value.absolute_percentage.percentage;
											if ("majority" in percentage) return "majority";
											return "custom_percentage";
										}
										if (field.value && "threshold_quorum" in field.value)
											return "threshold_quorum";
										if (field.value && "absolute_count" in field.value)
											return "absolute_count";
										return "majority"; // Default
									};

									return (
										<RadioGroup
											value={getCurrentType()}
											onValueChange={(value) => {
												switch (value) {
													case "majority":
														setValue("enrollmentInfo.useDaoHost.threshold", {
															absolute_percentage: {
																percentage: { majority: {} },
															},
														});
														break;
													case "custom_percentage":
														setValue("enrollmentInfo.useDaoHost.threshold", {
															absolute_percentage: {
																percentage: { percent: "0.66" },
															},
														});
														break;
													case "threshold_quorum":
														setValue("enrollmentInfo.useDaoHost.threshold", {
															threshold_quorum: {
																threshold: { percent: "0.51" },
																quorum: { percent: "0.33" },
															},
														});
														break;
													case "absolute_count":
														setValue("enrollmentInfo.useDaoHost.threshold", {
															absolute_count: {
																threshold: "10",
															},
														});
														break;
												}
											}}
											aria-labelledby="decision-method-label"
										>
											<Radio
												value="majority"
												description="Simple majority (more than 50% must vote yes)"
											>
												Simple Majority
											</Radio>
											<Radio
												value="custom_percentage"
												description="Custom percentage of participants must vote yes"
											>
												Custom Percentage
											</Radio>
											<Radio
												value="threshold_quorum"
												description="Requires minimum participation and approval threshold"
											>
												Participation Threshold
											</Radio>
											<Radio
												value="absolute_count"
												description="Specific number of yes votes required"
											>
												Fixed Vote Count
											</Radio>
										</RadioGroup>
									);
								}}
							/>
						</div>

						{/* Conditional fields based on threshold type */}
						{thresholdType && "threshold_quorum" in thresholdType && (
							<Card className="p-4">
								<h4 className="mb-3 font-medium">Participation Requirements</h4>
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
									<div>
										<Controller
											name="enrollmentInfo.useDaoHost.threshold.threshold_quorum.threshold.percent"
											control={control}
											render={({ field, fieldState: { error } }) => (
												<div className="space-y-2">
													<label
														htmlFor="approval-rate-input"
														className="flex items-center gap-1 font-medium text-sm"
													>
														Approval Rate
														<Tooltip content="Percentage of 'Yes' votes required out of all votes cast">
															<Info className="h-4 w-4 text-foreground/50" />
														</Tooltip>
													</label>
													<Input
														id="approval-rate-input"
														{...field}
														type="number"
														min="1"
														max="100"
														step="1"
														placeholder="51"
														endContent={<span>%</span>}
														description="51% means more than half of voters must approve"
														isInvalid={!!error}
														errorMessage={error?.message}
														isDisabled={isSubmitting}
														aria-label="Approval rate percentage"
													/>
												</div>
											)}
										/>
									</div>
									<div>
										<Controller
											name="enrollmentInfo.useDaoHost.threshold.threshold_quorum.quorum.percent"
											control={control}
											render={({ field, fieldState: { error } }) => (
												<div className="space-y-2">
													<label
														htmlFor="min-participation-input"
														className="flex items-center gap-1 font-medium text-sm"
													>
														Minimum Participation
														<Tooltip content="Percentage of all eligible voters who must cast a vote">
															<Info className="h-4 w-4 text-foreground/50" />
														</Tooltip>
													</label>
													<Input
														id="min-participation-input"
														{...field}
														type="number"
														min="1"
														max="100"
														step="1"
														placeholder="33"
														endContent={<span>%</span>}
														description="33% means at least 1/3 of members must vote"
														isInvalid={!!error}
														errorMessage={error?.message}
														isDisabled={isSubmitting}
														aria-label="Minimum participation percentage"
													/>
												</div>
											)}
										/>
									</div>
								</div>
							</Card>
						)}

						{thresholdType &&
							"absolute_percentage" in thresholdType &&
							"percent" in thresholdType.absolute_percentage.percentage && (
								<Card className="p-4">
									<h4 className="mb-3 font-medium">
										Custom Percentage Requirement
									</h4>
									<Controller
										name="enrollmentInfo.useDaoHost.threshold.absolute_percentage.percentage.percent"
										control={control}
										render={({ field, fieldState: { error } }) => (
											<div className="max-w-xs space-y-2">
												<label
													htmlFor="custom-percentage-input"
													className="flex items-center gap-1 font-medium text-sm"
												>
													Required Approval Percentage
													<Tooltip content="Percentage of all members that must vote 'Yes'">
														<Info className="h-4 w-4 text-foreground/50" />
													</Tooltip>
												</label>
												<Input
													id="custom-percentage-input"
													{...field}
													type="number"
													min="1"
													max="100"
													step="1"
													placeholder="66"
													endContent={<span>%</span>}
													description="66% means two-thirds must approve"
													isInvalid={!!error}
													errorMessage={error?.message}
													isDisabled={isSubmitting}
													aria-label="Required approval percentage"
												/>
											</div>
										)}
									/>
								</Card>
							)}

						{thresholdType && "absolute_count" in thresholdType && (
							<Card className="p-4">
								<h4 className="mb-3 font-medium">Fixed Vote Requirement</h4>
								<Controller
									name="enrollmentInfo.useDaoHost.threshold.absolute_count.threshold"
									control={control}
									render={({ field, fieldState: { error } }) => (
										<div className="max-w-xs space-y-2">
											<label
												htmlFor="vote-count-input"
												className="flex items-center gap-1 font-medium text-sm"
											>
												Required Number of 'Yes' Votes
												<Tooltip content="The exact number of members that must vote 'Yes'">
													<Info className="h-4 w-4 text-foreground/50" />
												</Tooltip>
											</label>
											<Input
												id="vote-count-input"
												{...field}
												type="number"
												min="1"
												step="1"
												placeholder="10"
												description="Proposal passes when this many members approve"
												isInvalid={!!error}
												errorMessage={error?.message}
												isDisabled={isSubmitting}
												aria-label="Required number of yes votes"
											/>
										</div>
									)}
								/>
							</Card>
						)}
					</div>
				</>
			)}
		</div>
	);
};

export default DaoConfigForm;
