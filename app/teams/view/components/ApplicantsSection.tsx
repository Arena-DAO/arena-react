"use client";

import { Card, CardBody, CardHeader, Chip, Tab, Tabs, Tooltip } from "@heroui/react";
import type { Key } from "@react-types/shared";
import { Clock, UserCheck, Users, UserX } from "lucide-react";
import { useState } from "react";
import type { ApplicantStatus, EntryStatus } from "~/codegen/ArenaTeamEnrollments.types";
import { ApplicantsList } from "./ApplicantsList";

interface ApplicantsSectionProps {
	isCreator: boolean;
	entryId: number;
	entryStatus?: EntryStatus;
}

export const ApplicantsSection = ({ isCreator, entryId, entryStatus }: ApplicantsSectionProps) => {
	const [selectedTab, setSelectedTab] = useState<Key>("default");

	// Status configurations
	const statusTabs: {
		key: string;
		status: ApplicantStatus;
		label: string;
		icon: typeof Clock;
	}[] = [
		{ key: "default", status: "default", label: "Pending", icon: Clock },
		{ key: "approved", status: "approved", label: "Approved", icon: UserCheck },
		{ key: "rejected", status: { rejected: { reason: "" } }, label: "Rejected", icon: UserX },
	];

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
									status={status.status}
									isCreator={isCreator}
									entryId={entryId}
									entryStatus={entryStatus}
								/>
							</Tab>
						);
					})}
				</Tabs>
			</CardBody>
		</Card>
	);
};
