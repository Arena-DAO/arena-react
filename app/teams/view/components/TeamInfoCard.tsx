// app/teams/entry/[entryId]/components/TeamInfoCard.tsx
"use client";

import Profile from "@/components/Profile";
import { useChain } from "@cosmos-kit/react";
import { Avatar, Button, Card, CardBody, Chip, Progress, addToast } from "@heroui/react";
import { formatDistanceToNow } from "date-fns";
import { Calendar, Clock, Shield, UserCheck, UserMinus, UserX, Users } from "lucide-react";
import React from "react";
import { ArenaTeamEnrollmentsClient } from "~/codegen/ArenaTeamEnrollments.client";
import {
	useArenaTeamEnrollmentsApplyMutation,
	useArenaTeamEnrollmentsWithdrawApplicationMutation,
} from "~/codegen/ArenaTeamEnrollments.react-query";
import type {
	ApplicantResponse,
	ApplicantStatus,
	EntryStatus,
	TeamEntryResponse,
} from "~/codegen/ArenaTeamEnrollments.types";
import { useEnv } from "~/hooks/useEnv";

interface TeamInfoCardProps {
	entry: TeamEntryResponse;
	walletAddress?: string;
	userApplication?: ApplicantResponse;
	isCreator: boolean;
	entryId: number;
}

// Applicant status configurations
const APPLICANT_STATUS_CONFIG = {
	default: {
		color: "default" as const,
		label: "Pending",
		icon: Clock,
		description: "Application under review",
	},
	approved: {
		color: "success" as const,
		label: "Approved",
		icon: UserCheck,
		description: "Application approved - can join team",
	},
	rejected: {
		color: "danger" as const,
		label: "Rejected",
		icon: UserX,
		description: "Application declined",
	},
};

export const TeamInfoCard = ({
	entry,
	walletAddress,
	userApplication,
	isCreator,
	entryId,
}: TeamInfoCardProps) => {
	const env = useEnv();
	const { getSigningCosmWasmClient } = useChain(env.CHAIN);

	// Mutations
	const { mutateAsync: applyMutation, isLoading: isApplying } =
		useArenaTeamEnrollmentsApplyMutation();
	const { mutateAsync: withdrawMutation, isLoading: isWithdrawing } =
		useArenaTeamEnrollmentsWithdrawApplicationMutation();

	const hasApplied = !!userApplication;
	const createdTime = new Date(Number(entry.created_at) / 10 ** 6);

	// Calculate total applicants from the response
	const totalApplicants =
		entry.approved_applicants_count +
		entry.pending_applicants_count +
		entry.rejected_applicants_count;
	const approvalRate =
		totalApplicants > 0 ? (entry.approved_applicants_count / totalApplicants) * 100 : 0;

	// Helper functions
	const getStatusColor = (status: EntryStatus) => {
		switch (status) {
			case "open":
				return "success";
			case "created":
				return "primary";
			case "closed":
				return "warning";
			case "aborted":
				return "danger";
			default:
				return "default";
		}
	};

	const getApplicantStatusConfig = (status: ApplicantStatus) => {
		if (typeof status === "object" && "rejected" in status) {
			return APPLICANT_STATUS_CONFIG.rejected;
		}
		return (
			APPLICANT_STATUS_CONFIG[status as keyof typeof APPLICANT_STATUS_CONFIG] ||
			APPLICANT_STATUS_CONFIG.default
		);
	};

	// Actions
	const handleApply = async () => {
		if (!walletAddress) return;
		try {
			addToast({ color: "primary", description: "Submitting application..." });
			const signingClient = await getSigningCosmWasmClient();
			const enrollmentClient = new ArenaTeamEnrollmentsClient(
				signingClient,
				walletAddress,
				env.ARENA_TEAM_ENROLLMENTS_ADDRESS
			);

			await applyMutation({
				client: enrollmentClient,
				msg: { entryId },
			});

			addToast({
				color: "success",
				description: "Application submitted successfully!",
			});
		} catch (error) {
			console.error("Apply error:", error);
			addToast({
				color: "danger",
				description: (error as Error).message || "Failed to submit application",
			});
		}
	};

	const handleWithdraw = async () => {
		if (!walletAddress) return;
		try {
			addToast({ color: "primary", description: "Withdrawing application..." });
			const signingClient = await getSigningCosmWasmClient();
			const enrollmentClient = new ArenaTeamEnrollmentsClient(
				signingClient,
				walletAddress,
				env.ARENA_TEAM_ENROLLMENTS_ADDRESS
			);

			await withdrawMutation({
				client: enrollmentClient,
				msg: { entryId },
			});

			addToast({
				color: "success",
				description: "Application withdrawn successfully!",
			});
		} catch (error) {
			console.error("Withdraw error:", error);
			addToast({
				color: "danger",
				description: (error as Error).message || "Failed to withdraw application",
			});
		}
	};

	return (
		<Card className="overflow-visible">
			<CardBody className="p-6">
				<div className="flex flex-col gap-6 lg:flex-row">
					{/* Team Avatar and Basic Info */}
					<div className="flex flex-col items-center lg:items-start">
						<Avatar
							src={entry.dao_config.image_url ?? ""}
							name={entry.title}
							size="lg"
							className="mb-4 ring-2 ring-default-200"
							fallback={<Shield size={32} className="text-default-400" />}
							classNames={{
								base: "bg-gradient-to-br from-primary-100 to-secondary-100 w-24 h-24",
							}}
						/>
						<Chip
							color={getStatusColor(entry.status)}
							variant="solid"
							size="lg"
							className="font-semibold"
						>
							{entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
						</Chip>
					</div>

					{/* Team Details */}
					<div className="flex-1 space-y-4">
						<div>
							<h1 className="mb-2 font-bold text-3xl">{entry.title}</h1>
							<p className="text-default-600 leading-relaxed">{entry.description}</p>
						</div>

						{/* Team Stats */}
						<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
							<div className="rounded-lg border border-primary/10 bg-primary/5 p-3 text-center">
								<div className="mb-1 flex items-center justify-center gap-1">
									<Users size={16} className="text-primary" />
									<span className="font-bold text-primary text-xl">{totalApplicants}</span>
								</div>
								<div className="font-medium text-default-500 text-xs">Total Applicants</div>
							</div>
							<div className="rounded-lg border border-success/10 bg-success/5 p-3 text-center">
								<div className="mb-1 flex items-center justify-center gap-1">
									<UserCheck size={16} className="text-success" />
									<span className="font-bold text-success text-xl">
										{entry.approved_applicants_count}
									</span>
								</div>
								<div className="font-medium text-default-500 text-xs">Approved</div>
							</div>
							<div className="rounded-lg border border-warning/10 bg-warning/5 p-3 text-center">
								<div className="mb-1 flex items-center justify-center gap-1">
									<Clock size={16} className="text-warning" />
									<span className="font-bold text-warning text-xl">
										{entry.pending_applicants_count}
									</span>
								</div>
								<div className="font-medium text-default-500 text-xs">Pending</div>
							</div>
							<div className="rounded-lg border border-danger/10 bg-danger/5 p-3 text-center">
								<div className="mb-1 flex items-center justify-center gap-1">
									<UserX size={16} className="text-danger" />
									<span className="font-bold text-danger text-xl">
										{entry.rejected_applicants_count}
									</span>
								</div>
								<div className="font-medium text-default-500 text-xs">Rejected</div>
							</div>
						</div>

						{/* Approval Progress */}
						{totalApplicants > 0 && (
							<div>
								<div className="mb-2 flex items-center justify-between">
									<span className="font-medium text-default-600 text-sm">Approval Rate</span>
									<span className="font-bold text-sm text-success">
										{Math.round(approvalRate)}%
									</span>
								</div>
								<Progress
									value={approvalRate}
									color="success"
									size="md"
									classNames={{
										track: "border border-default-200",
										indicator: "bg-gradient-to-r from-success-400 to-success-600",
									}}
								/>
							</div>
						)}

						{/* Meta Info */}
						<div className="flex flex-wrap items-center gap-4 text-default-500 text-sm">
							<div className="flex items-center gap-1">
								<Calendar size={14} />
								<span>Created {formatDistanceToNow(createdTime, { addSuffix: true })}</span>
							</div>
							<div className="flex items-center gap-1">
								<span>By:</span>
								<Profile address={entry.creator} />
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					{walletAddress && entry.status === "open" && (
						<div className="flex flex-col gap-2 lg:w-48">
							{!hasApplied && !isCreator && (
								<Button
									color="primary"
									variant="shadow"
									size="lg"
									onPress={handleApply}
									isLoading={isApplying}
									startContent={<Shield size={18} />}
									className="w-full"
								>
									Apply to Join
								</Button>
							)}
							{hasApplied && !isCreator && (
								<div className="space-y-2">
									<div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-center">
										<div className="mb-1 font-medium text-primary">Application Status</div>
										<Chip
											color={getApplicantStatusConfig(userApplication?.status).color}
											variant="solid"
											size="sm"
											startContent={React.createElement(
												getApplicantStatusConfig(userApplication?.status).icon,
												{ size: 12 }
											)}
										>
											{getApplicantStatusConfig(userApplication?.status).label}
										</Chip>
									</div>
									{userApplication?.status === "default" && (
										<Button
											color="danger"
											variant="bordered"
											size="sm"
											onPress={handleWithdraw}
											isLoading={isWithdrawing}
											startContent={<UserMinus size={16} />}
											className="w-full"
										>
											Withdraw Application
										</Button>
									)}
								</div>
							)}
						</div>
					)}
				</div>
			</CardBody>
		</Card>
	);
};
