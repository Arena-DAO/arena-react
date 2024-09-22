"use client";

import { useChain } from "@cosmos-kit/react";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import type React from "react";
import { isActive } from "~/helpers/ArenaHelpers";
import { useEnv } from "~/hooks/useEnv";
import type { CompetitionResponse } from "~/types/CompetitionResponse";
import type { CompetitionType } from "~/types/CompetitionType";
import EditStatTypes from "./EditStatTypes";
import InputStatsModal from "./InputStatsModal";
import ProcessForm from "./ProcessForm";

interface CompetitionActionsProps {
	competition: CompetitionResponse;
	hideProcess?: boolean;
	competitionType: CompetitionType;
	moduleAddr: string;
}

const CompetitionActions: React.FC<CompetitionActionsProps> = ({
	competition,
	hideProcess = false,
	competitionType,
	moduleAddr,
}) => {
	const { data: env } = useEnv();
	const { address } = useChain(env.CHAIN);

	const showEditStatTypes =
		(address === competition.host || address === env.ARENA_DAO_ADDRESS) &&
		(isActive(competition.status) || competition.status === "pending");

	const showHostProcessForm =
		(address === competition.host || address === env.ARENA_DAO_ADDRESS) &&
		!hideProcess &&
		isActive(competition.status);

	const showInputStatsForm =
		address === competition.host || address === env.ARENA_DAO_ADDRESS;

	const showExpiredProcessForm =
		competition.is_expired &&
		competition.status !== "inactive" &&
		competition.status !== "pending";

	const hasAnyAction =
		showEditStatTypes || showHostProcessForm || showExpiredProcessForm;

	if (!hasAnyAction) {
		return null;
	}

	return (
		<Card>
			<CardHeader>
				<h2 className="font-semibold text-xl">Competition Actions</h2>
			</CardHeader>
			<CardBody>
				<div className="flex flex-wrap gap-2">
					{showEditStatTypes && (
						<EditStatTypes
							moduleAddr={moduleAddr}
							competitionId={competition.id}
						/>
					)}
					{showInputStatsForm && (
						<InputStatsModal
							moduleAddr={moduleAddr}
							competitionId={competition.id}
						/>
					)}
					{showHostProcessForm && (
						<ProcessForm
							moduleAddr={moduleAddr}
							competitionId={competition.id}
							host={competition.host}
							competitionType={competitionType}
							escrow={competition.escrow}
						/>
					)}
					{showExpiredProcessForm && (
						<ProcessForm
							moduleAddr={moduleAddr}
							competitionId={competition.id}
							is_expired
							competitionType={competitionType}
						/>
					)}
				</div>
			</CardBody>
		</Card>
	);
};

export default CompetitionActions;
