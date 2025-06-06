// app/teams/components/TeamEnrollmentCard.tsx
"use client";

import Profile from "@/components/Profile";
import {
	Avatar,
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Chip,
	Link,
	Progress,
} from "@heroui/react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Calendar, Clock, Shield, UserCheck, UserX, Users } from "lucide-react";
import type { EntryStatus, TeamEntryResponse } from "~/codegen/ArenaTeamEnrollments.types";

interface TeamEnrollmentCardProps {
	entry: TeamEntryResponse;
}

const TeamEnrollmentCard = ({ entry }: TeamEnrollmentCardProps) => {
	const createdTime = new Date(Number(entry.created_at) / 10 ** 6);
	const totalApplicants =
		entry.approved_applicants_count +
		entry.pending_applicants_count +
		entry.rejected_applicants_count;
	const approvalRate =
		totalApplicants > 0 ? (entry.approved_applicants_count / totalApplicants) * 100 : 0;

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

	const getStatusIcon = (status: EntryStatus) => {
		switch (status) {
			case "open":
				return <Shield size={14} />;
			case "created":
				return <UserCheck size={14} />;
			case "closed":
				return <Clock size={14} />;
			case "aborted":
				return <UserX size={14} />;
			default:
				return <Shield size={14} />;
		}
	};

	return (
		<motion.div
			variants={{
				hidden: { y: 20, opacity: 0 },
				visible: { y: 0, opacity: 1 },
			}}
		>
			<Card
				isPressable
				as={Link}
				href={`/teams/view?entryId=${entry.entry_id}${entry.category_id ? `&category=${entry.category_id}` : ""}`}
				className="h-full transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
			>
				<CardHeader className="flex gap-3 pb-2">
					<Avatar
						src={entry.dao_config.image_url ?? ""}
						name={entry.title}
						size="md"
						fallback={<Shield size={20} className="text-default-400" />}
						classNames={{
							base: "bg-gradient-to-br from-primary-100 to-secondary-100",
						}}
					/>
					<div className="flex min-w-0 flex-1 flex-col">
						<h3 className="truncate font-bold text-foreground text-large">{entry.title}</h3>
						{entry.dao_config.dao_name && (
							<p className="truncate text-default-500 text-sm">{entry.dao_config.dao_name}</p>
						)}
						<div className="flex items-center gap-2">
							<Chip
								color={getStatusColor(entry.status)}
								variant="flat"
								size="sm"
								startContent={getStatusIcon(entry.status)}
								className="font-medium"
							>
								{entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
							</Chip>
						</div>
					</div>
				</CardHeader>

				<CardBody className="pt-0 pb-2">
					<p className="mb-4 line-clamp-3 text-default-600 text-sm">{entry.description}</p>

					{/* Team Stats */}
					<div className="mb-4 grid grid-cols-3 gap-2">
						<div className="rounded-lg border border-primary/10 bg-primary/5 p-2 text-center">
							<div className="mb-1 flex items-center justify-center gap-1">
								<Users size={12} className="text-primary" />
								<span className="font-bold text-primary text-sm">{totalApplicants}</span>
							</div>
							<div className="text-default-500 text-xs">Total</div>
						</div>
						<div className="rounded-lg border border-success/10 bg-success/5 p-2 text-center">
							<div className="mb-1 flex items-center justify-center gap-1">
								<UserCheck size={12} className="text-success" />
								<span className="font-bold text-sm text-success">
									{entry.approved_applicants_count}
								</span>
							</div>
							<div className="text-default-500 text-xs">Approved</div>
						</div>
						<div className="rounded-lg border border-warning/10 bg-warning/5 p-2 text-center">
							<div className="mb-1 flex items-center justify-center gap-1">
								<Clock size={12} className="text-warning" />
								<span className="font-bold text-sm text-warning">
									{entry.pending_applicants_count}
								</span>
							</div>
							<div className="text-default-500 text-xs">Pending</div>
						</div>
					</div>

					{/* Approval Progress */}
					{totalApplicants > 0 && (
						<div className="mb-4">
							<div className="mb-1 flex items-center justify-between">
								<span className="text-default-600 text-xs">Approval Rate</span>
								<span className="font-bold text-success text-xs">{Math.round(approvalRate)}%</span>
							</div>
							<Progress
								value={approvalRate}
								color="success"
								size="sm"
								classNames={{
									track: "border border-default-200",
									indicator: "bg-gradient-to-r from-success-400 to-success-600",
								}}
							/>
						</div>
					)}
				</CardBody>

				<CardFooter className="flex flex-col gap-2 pt-0">
					{/* Meta Info */}
					<div className="flex w-full items-center justify-between text-default-500 text-xs">
						<div className="flex items-center gap-1">
							<Calendar size={12} />
							<span>{formatDistanceToNow(createdTime, { addSuffix: true })}</span>
						</div>
					</div>

					{/* Creator */}
					<div className="flex w-full items-center justify-between">
						<div className="flex items-center gap-1 text-default-500 text-xs">
							<span>Created by:</span>
						</div>
						<Profile address={entry.creator} />
					</div>

					{entry.status === "open" && (
						<Button
							color="primary"
							variant="flat"
							size="sm"
							className="mt-2 w-full"
							startContent={<Shield size={14} />}
						>
							View Details
						</Button>
					)}
				</CardFooter>
			</Card>
		</motion.div>
	);
};

export default TeamEnrollmentCard;
