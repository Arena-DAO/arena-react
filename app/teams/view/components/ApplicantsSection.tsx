// app/teams/entry/[entryId]/components/ApplicantsSection.tsx
"use client";

import { Card, CardBody, CardHeader, Chip, Spinner, Tab, Tabs, Tooltip } from "@heroui/react";
import type { Key } from "@react-types/shared";
import { Clock, UserCheck, UserX, Users } from "lucide-react";
import { useMemo, useState } from "react";
import type { ApplicantResponse } from "~/codegen/ArenaTeamEnrollments.types";
import { ApplicantsList } from "./ApplicantsList";

interface ApplicantsSectionProps {
	applicants?: ApplicantResponse[];
	isApplicantsLoading: boolean;
	isCreator: boolean;
	entryId: number;
}

export const ApplicantsSection = ({
	applicants,
	isApplicantsLoading,
	isCreator,
	entryId,
}: ApplicantsSectionProps) => {
	const [selectedTab, setSelectedTab] = useState<Key>("default");

	// Organize applicants by status
	const organizedApplicants = useMemo(() => {
		if (!applicants) return { default: [], approved: [], rejected: [] };

		return {
			default: applicants.filter((a) => a.status === "default"),
			approved: applicants.filter((a) => a.status === "approved"),
			rejected: applicants.filter((a) => typeof a.status === "object" && "rejected" in a.status),
		};
	}, [applicants]);

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
				{isApplicantsLoading ? (
					<div className="flex items-center justify-center py-12">
						<Spinner size="lg" />
					</div>
				) : (
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
						<Tab
							key="default"
							title={
								<div className="flex items-center space-x-2">
									<Clock size={14} />
									<span>Pending</span>
								</div>
							}
						>
							<ApplicantsList
								applicants={organizedApplicants.default}
								isCreator={isCreator}
								entryId={entryId}
							/>
						</Tab>
						<Tab
							key="approved"
							title={
								<div className="flex items-center space-x-2">
									<UserCheck size={14} />
									<span>Approved</span>
								</div>
							}
						>
							<ApplicantsList
								applicants={organizedApplicants.approved}
								isCreator={isCreator}
								entryId={entryId}
							/>
						</Tab>
						<Tab
							key="rejected"
							title={
								<div className="flex items-center space-x-2">
									<UserX size={14} />
									<span>Rejected</span>
								</div>
							}
						>
							<ApplicantsList
								applicants={organizedApplicants.rejected}
								isCreator={isCreator}
								entryId={entryId}
							/>
						</Tab>
					</Tabs>
				)}
			</CardBody>
		</Card>
	);
};
