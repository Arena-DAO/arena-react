"use client";

import { Card, CardBody, CardHeader, Chip, Tab, Tabs, Tooltip } from "@heroui/react";
import type { Key } from "@react-types/shared";
import { Clock, UserCheck, UserX, Users } from "lucide-react";
import { useState } from "react";
import { ArenaTeamEnrollmentsQueryClient } from "~/codegen/ArenaTeamEnrollments.client";
import { useArenaTeamEnrollmentsListApplicantsQuery } from "~/codegen/ArenaTeamEnrollments.react-query";
import type { ApplicantStatus } from "~/codegen/ArenaTeamEnrollments.types";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import { ApplicantsList } from "./ApplicantsList";

interface ApplicantsSectionProps {
	isCreator: boolean;
	entryId: number;
}

export const ApplicantsSection = ({ isCreator, entryId }: ApplicantsSectionProps) => {
	const env = useEnv();
	const { data: client } = useCosmWasmClient();
	const [selectedTab, setSelectedTab] = useState<Key>("default");

	// Status configurations
	const statusTabs: {
		key: string;
		status: ApplicantStatus | undefined;
		label: string;
		icon: typeof Clock;
	}[] = [
		{ key: "default", status: "default", label: "Pending", icon: Clock },
		{ key: "approved", status: "approved", label: "Approved", icon: UserCheck },
		{ key: "rejected", status: { rejected: { reason: "" } }, label: "Rejected", icon: UserX },
	];

	// Get current status for queries
	const getCurrentStatus = (): ApplicantStatus | undefined => {
		const tab = statusTabs.find((t) => t.key === selectedTab);
		return tab?.status;
	};

	// Fetch applicants for the selected status
	const { data: applicants, isLoading: isApplicantsLoading } =
		useArenaTeamEnrollmentsListApplicantsQuery({
			client:
				client && new ArenaTeamEnrollmentsQueryClient(client, env.ARENA_TEAM_ENROLLMENTS_ADDRESS),
			args: {
				entryId,
				status: getCurrentStatus(),
				limit: 100,
			},
			options: { enabled: !!client },
		});

	return (
		<Card>
			<CardHeader className="px-6 py-4">
				<div className="flex w-full items-center justify-between">
					<div className="flex items-center gap-2">
						<Users size={20} className="text-primary" />
						<h2 className="font-bold text-xl">Applicants</h2>
					</div>
					{isCreator && (
						<Tooltip content="As the team creator, you can approve or reject applicants">
							<Chip variant="flat" color="primary" size="sm">
								Team Creator
							</Chip>
						</Tooltip>
					)}
				</div>
			</CardHeader>
			<CardBody className="p-0">
				<Tabs
					selectedKey={selectedTab}
					onSelectionChange={setSelectedTab}
					color="primary"
					variant="underlined"
					classNames={{
						tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider px-6",
						cursor: "w-full bg-primary",
						tab: "max-w-fit px-0 h-12",
						tabContent: "group-data-[selected=true]:text-primary",
					}}
				>
					{statusTabs.map((status) => {
						const IconComponent = status.icon;
						return (
							<Tab
								key={status.key}
								title={
									<div className="flex items-center space-x-2">
										<IconComponent size={14} />
										<span>{status.label}</span>
									</div>
								}
							>
								<ApplicantsList
									applicants={applicants || []}
									isApplicantsLoading={isApplicantsLoading}
									isCreator={isCreator}
									entryId={entryId}
								/>
							</Tab>
						);
					})}
				</Tabs>
			</CardBody>
		</Card>
	);
};
