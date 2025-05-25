// components/TeamEnrollmentCard.tsx
"use client";

import Profile from "@/components/Profile";
import { Avatar, Card, CardBody } from "@heroui/react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Calendar, Shield, Target, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import type {
	EntryStatus,
	TeamEntryResponse,
} from "~/codegen/ArenaTeamEnrollments.types";

interface TeamEnrollmentCardProps {
	entry: TeamEntryResponse;
}

const TeamEnrollmentCard = ({ entry }: TeamEnrollmentCardProps) => {
	const router = useRouter();
	const createdTime = new Date(Number(entry.created_at) / 10 ** 6);

	const getStatusConfig = (status: EntryStatus) => {
		switch (status) {
			case "open":
				return {
					color: "success" as const,
					label: "Open",
					bgGradient: "from-success-50 to-success-100",
					textColor: "text-success-600",
				};
			case "created":
				return {
					color: "primary" as const,
					label: "Created",
					bgGradient: "from-primary-50 to-primary-100",
					textColor: "text-primary-600",
				};
			case "closed":
				return {
					color: "warning" as const,
					label: "Closed",
					bgGradient: "from-warning-50 to-warning-100",
					textColor: "text-warning-600",
				};
			case "aborted":
				return {
					color: "danger" as const,
					label: "Aborted",
					bgGradient: "from-danger-50 to-danger-100",
					textColor: "text-danger-600",
				};
			default:
				return {
					color: "default" as const,
					label: status,
					bgGradient: "from-default-50 to-default-100",
					textColor: "text-default-600",
				};
		}
	};

	const statusConfig = getStatusConfig(entry.status);
	const approvalRate =
		entry.applicants_count > 0
			? (entry.approved_applicants_count / entry.applicants_count) * 100
			: 0;

	return (
		<motion.div
			variants={{
				hidden: { y: 20, opacity: 0 },
				visible: { y: 0, opacity: 1 },
			}}
			transition={{ duration: 0.4 }}
			whileHover={{ y: -4 }}
			className="h-full"
		>
			<Card
				className="group h-full cursor-pointer border border-transparent transition-all duration-300 hover:border-primary/20 hover:shadow-primary/10 hover:shadow-xl"
				isPressable
				onPress={() => router.push(`/teams/entry/${entry.entry_id}`)}
			>
				<CardBody className="flex flex-col overflow-hidden p-0">
					<div className="flex flex-1 flex-col p-5">
						{/* Team Avatar and Title */}
						<div className="mb-4 flex items-start gap-4">
							<Avatar
								src={entry.dao_config.image_url ?? undefined}
								name={entry.title}
								size="lg"
								className="flex-shrink-0 ring-2 ring-default-200 transition-all group-hover:ring-primary/30"
								fallback={<Shield size={24} className="text-default-400" />}
								classNames={{
									base: "bg-gradient-to-br from-primary-100 to-secondary-100",
									fallback: "text-default-500",
								}}
							/>
							<div className="min-w-0 flex-1">
								<h3 className="mb-1 line-clamp-2 font-bold text-lg transition-colors group-hover:text-primary">
									{entry.title}
								</h3>
								<div className="flex items-center gap-2 text-default-500 text-xs">
									<Calendar size={12} />
									<span>
										{formatDistanceToNow(createdTime, { addSuffix: true })}
									</span>
								</div>
							</div>
						</div>

						{/* Description */}
						<p className="mb-4 line-clamp-3 flex-1 text-default-600 text-sm leading-relaxed">
							{entry.description}
						</p>

						{/* Enhanced Stats Grid */}
						<div className="mb-4 grid grid-cols-2 gap-3">
							<div className="rounded-lg border border-primary/10 bg-primary/5 p-3 text-center">
								<div className="mb-1 flex items-center justify-center gap-1">
									<Users size={14} className="text-primary" />
									<span className="font-bold text-lg text-primary">
										{entry.applicants_count}
									</span>
								</div>
								<div className="font-medium text-default-500 text-xs">
									Total Applicants
								</div>
							</div>
							<div className="rounded-lg border border-success/10 bg-success/5 p-3 text-center">
								<div className="mb-1 flex items-center justify-center gap-1">
									<Target size={14} className="text-success" />
									<span className="font-bold text-lg text-success">
										{entry.approved_applicants_count}
									</span>
								</div>
								<div className="font-medium text-default-500 text-xs">
									Approved
								</div>
							</div>
						</div>

						{/* Creator Profile */}
						<div className="mb-4">
							<div className="flex items-center gap-2">
								<span className="font-medium text-default-500 text-xs">
									Created by:
								</span>
								<Profile address={entry.creator} />
							</div>
						</div>

						{/* Hover effect indicator */}
						<div className="mt-auto border-default-100 border-t pt-3">
							<div className="text-center">
								<span className="font-medium text-default-400 text-xs transition-colors group-hover:text-primary">
									Click to view details →
								</span>
							</div>
						</div>
					</div>
				</CardBody>
			</Card>
		</motion.div>
	);
};

export default TeamEnrollmentCard;
